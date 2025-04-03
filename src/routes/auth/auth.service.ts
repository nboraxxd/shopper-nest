import ms from 'ms'
import { addMilliseconds } from 'date-fns'
import { Injectable, UnauthorizedException } from '@nestjs/common'

import envConfig from 'src/shared/env-config'
import { generateOTP } from 'src/shared/utils'
import { JsonWebTokenException } from 'src/shared/models/error.model'
import { UserStatus } from 'src/shared/constants/user.constant'
import { TypeOfVerificationCode } from 'src/shared/constants/common.constant'
import { AccessTokenPayloadSign, RefreshTokenPayload } from 'src/shared/types/jwt.type'
import { isJsonWebTokenError, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/utils/errors'
import { TokenService } from 'src/shared/services/token.service'
import { MailingService } from 'src/shared/services/mailing.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { TwoFactorAuthService } from 'src/shared/services/2fa.service'
import { UserRepository } from 'src/shared/repositories/user.repo'

import {
  DevicePayload,
  ForgotPasswordBody,
  LoginBody,
  LoginDataRes,
  LogoutBody,
  RefreshTokenBody,
  RefreshTokenDataRes,
  RegisterBody,
  RegisterDataRes,
  SendOTPBody,
  Setup2FADataRes,
  VerificationCodeModel,
} from 'src/routes/auth/auth.model'
import {
  DuplicateRefreshTokenException,
  EmailAlreadyExistsException,
  EmailDoesNotExistException,
  EmailOrPasswordIncorrectException,
  ExpiredOTPCodeException,
  InvalidOTPCodeException,
  InvalidTOTPCodeException,
  NoNeededCodeOrTOTPException,
  RefreshTokenNotFoundException,
  TwoFactorAuthAlreadyEnabledException,
} from 'src/routes/auth/error.model'
import { RolesService } from 'src/routes/auth/roles.service'
import { UserService } from 'src/shared/services/user.service'
import { AuthRepesitory } from 'src/routes/auth/auth.repo'

@Injectable()
export class AuthService {
  constructor(
    private readonly mailingService: MailingService,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    private readonly userService: UserService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepesitory
  ) {}

  async generateTokens({ deviceId, roleId, roleName, userId }: AccessTokenPayloadSign) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ deviceId, roleId, roleName, userId }),
      this.tokenService.signRefreshToken({ userId }),
    ])

    return { accessToken, refreshToken }
  }

  async saveRefreshToken({ deviceId, token }: { token: string; deviceId: number }) {
    const { exp, userId } = this.tokenService.decodeToken<RefreshTokenPayload>(token)

    try {
      await this.authRepository.insertRefreshToken({
        userId,
        token,
        expiresAt: new Date(exp * 1000),
        deviceId,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw DuplicateRefreshTokenException
      }
      throw error
    }
  }

  async verifyVerificationCode({
    email,
    code,
    type,
  }: Pick<VerificationCodeModel, 'code' | 'email' | 'type'>): Promise<VerificationCodeModel> {
    const verificationModel = await this.authRepository.findUniqueVerificationCode({
      email_code_type: { email, code, type },
    })

    if (!verificationModel) {
      throw InvalidOTPCodeException
    }

    if (verificationModel.expiresAt < new Date()) {
      throw ExpiredOTPCodeException
    }

    return verificationModel
  }

  async register(payload: RegisterBody & DevicePayload): Promise<RegisterDataRes> {
    const { email, name, password, code, ip, userAgent } = payload

    try {
      await this.verifyVerificationCode({ email, code, type: TypeOfVerificationCode.REGISTER })

      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(password)

      const [user] = await Promise.all([
        this.authRepository.insertUserIncludeRole({
          email,
          name,
          password: hashedPassword,
          roleId: clientRoleId,
          status: UserStatus.ACTIVE,
        }),
        this.authRepository.deleteVerificationCode({
          email_code_type: { email, code, type: TypeOfVerificationCode.REGISTER },
        }),
      ])

      const device = await this.authRepository.insertDevice({
        userId: user.id,
        ip,
        userAgent,
      })

      const tokens = await this.generateTokens({
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
        userId: user.id,
      })

      await this.saveRefreshToken({ token: tokens.refreshToken, deviceId: device.id })

      return tokens
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException
      }
      throw error
    }
  }

  async sendOTP({ email, type }: SendOTPBody): Promise<void> {
    const user = await this.userRepository.findUnique({ email })

    if (type === 'REGISTER' && user) {
      throw EmailAlreadyExistsException
    } else if (type === 'FORGOT_PASSWORD' && !user) {
      throw EmailDoesNotExistException
    }

    setImmediate(() => {
      ;(async () => {
        const code = generateOTP()

        await this.authRepository.upsertVerificationCode({
          email,
          code,
          type,
          expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as ms.StringValue)),
        })

        await this.mailingService.sendOTP({
          to: email,
          code: code,
          subject: `${code} là mã xác minh của bạn`,
        })
      })().catch(() => {})
    })
  }

  async login(payload: LoginBody & DevicePayload): Promise<LoginDataRes> {
    const user = await this.userRepository.findUniqueIncludeRole({ email: payload.email })
    if (!user) {
      throw EmailOrPasswordIncorrectException('email')
    }

    const isPasswordValid = await this.hashingService.compare(payload.password, user.password)
    if (!isPasswordValid) {
      throw EmailOrPasswordIncorrectException('email')
    }

    if (user.totpSecret) {
      if (!payload.totpCode && !payload.code) {
        // Không throw lỗi trong case này
        // Frontend dựa vào is2FARequired để show modal nhập TOTP
        return { is2FARequired: true }
      } else if (payload.totpCode) {
        const isValid = this.twoFactorAuthService.verifyTOTP(payload.totpCode, user.totpSecret)
        if (!isValid) {
          throw InvalidTOTPCodeException
        }
      } else if (payload.code) {
        await this.verifyVerificationCode({
          email: user.email,
          code: payload.code,
          type: TypeOfVerificationCode.LOGIN,
        })
      }
    }

    if (!user.totpSecret && (payload.code || payload.totpCode)) {
      throw NoNeededCodeOrTOTPException
    }

    const device = await this.authRepository.insertDevice({
      userId: user.id,
      ip: payload.ip,
      userAgent: payload.userAgent,
    })

    const tokens = await this.generateTokens({
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
      userId: user.id,
    })

    await this.saveRefreshToken({ token: tokens.refreshToken, deviceId: device.id })

    return tokens
  }

  async refreshToken(payload: RefreshTokenBody & DevicePayload): Promise<RefreshTokenDataRes> {
    const { refreshToken, ip, userAgent } = payload

    try {
      const tokenPayload = await this.tokenService.verifyRefreshToken(refreshToken)

      const refreshTokenInDb = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({ token: refreshToken })

      if (!refreshTokenInDb) {
        throw RefreshTokenNotFoundException
      }

      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDb

      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.tokenService.signAccessToken({ deviceId, roleId, roleName, userId: tokenPayload.userId }),
        this.tokenService.signRefreshToken({ userId: tokenPayload.userId, exp: tokenPayload.exp }),
      ])

      await Promise.all([
        this.authRepository.deleteRefreshToken(refreshToken),
        this.authRepository.updateDevice(deviceId, { ip, userAgent }),
        this.saveRefreshToken({ token: newRefreshToken, deviceId }),
      ])

      return { accessToken: newAccessToken, refreshToken: newRefreshToken }
    } catch (error) {
      if (isJsonWebTokenError(error)) {
        throw new UnauthorizedException(error.message)
      }
      throw error
    }
  }

  async logout({ refreshToken }: LogoutBody): Promise<void> {
    try {
      await this.tokenService.verifyRefreshToken(refreshToken)

      const deletedRefreshToken = await this.authRepository.deleteRefreshToken(refreshToken)

      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, { isActive: false })
    } catch (error) {
      if (isJsonWebTokenError(error)) {
        throw JsonWebTokenException(error.message)
      } else if (isNotFoundPrismaError(error)) {
        throw RefreshTokenNotFoundException
      }
      throw error
    }
  }

  async forgotPassword({ code, email, password }: ForgotPasswordBody): Promise<void> {
    try {
      // Kiểm tra xem email có tồn tại và mã xác minh có hợp lệ không
      const [user] = await Promise.all([
        this.userRepository.findUnique({ email }),
        this.verifyVerificationCode({ email, code, type: TypeOfVerificationCode.FORGOT_PASSWORD }),
      ])

      if (!user) {
        throw EmailDoesNotExistException
      }

      const hashedPassword = await this.hashingService.hash(password)

      // Cập nhật mật khẩu mới cho user và xóa mã xác minh
      await Promise.all([
        this.userRepository.update({ email }, { password: hashedPassword }),
        this.authRepository.deleteVerificationCode({
          email_code_type: { email, code, type: TypeOfVerificationCode.FORGOT_PASSWORD },
        }),
      ])
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw EmailDoesNotExistException
      }
      throw error
    }
  }

  async setupTwoFactorAuth(userId: number): Promise<Setup2FADataRes> {
    // Bước 1. Kiểm tra thông tin user
    const user = await this.userService.validateUserStatus({ id: userId })

    // Bước 2. Kiểm tra user đã bật 2FA chưa
    if (user.totpSecret) {
      throw TwoFactorAuthAlreadyEnabledException
    }

    // Bước 3. Tạo secret key và uri 2FA
    const { secret, uri } = this.twoFactorAuthService.generateTOTPSecret(user.email)

    // Bước 4. Lưu secret key vào db
    await this.userRepository.update({ id: userId }, { totpSecret: secret })

    // Bước 5. Trả về secret key và uri 2FA
    return { secret, uri }
  }
}
