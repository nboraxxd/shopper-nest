import ms from 'ms'
import { addMilliseconds } from 'date-fns'
import { Injectable, UnauthorizedException } from '@nestjs/common'

import envConfig from 'src/shared/env-config'
import { generateOTP } from 'src/shared/utils'
import { UserStatus } from 'src/shared/constants/user.constant'
import { TypeOfVerificationCode } from 'src/shared/constants/common.constant'
import { JsonWebTokenException, UserNotFoundException } from 'src/shared/models/error.model'
import { AccessTokenPayload, AccessTokenPayloadSign, RefreshTokenPayload } from 'src/shared/types/jwt.type'
import { isJsonWebTokenError, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/utils/errors'

import { UserService } from 'src/shared/services/user.service'
import { TokenService } from 'src/shared/services/token.service'
import { MailingService } from 'src/shared/services/mailing.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { TwoFactorAuthService } from 'src/shared/services/2fa.service'
import { UserRepository } from 'src/shared/repositories/user.repo'

import {
  DevicePayload,
  Disable2FABody,
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
  TwoFactorAuthNotEnabledException,
} from 'src/routes/auth/auth.error'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import { UserModel } from 'src/shared/models/user.model'
import { RoleRepository } from 'src/shared/repositories/role.repo'

@Injectable()
export class AuthService {
  constructor(
    private readonly mailingService: MailingService,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly roleRepository: RoleRepository,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async generateTokens(payload: AccessTokenPayloadSign): Promise<{ accessToken: string; refreshToken: string }> {
    const { deviceId, roleId, roleName, userId } = payload

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ deviceId, roleId, roleName, userId }),
      this.tokenService.signRefreshToken({ userId }),
    ])

    return { accessToken, refreshToken }
  }

  async saveRefreshToken({ deviceId, token }: { token: string; deviceId: number }): Promise<void> {
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

  async verifyVerificationCode(
    data: Pick<VerificationCodeModel, 'code' | 'email' | 'type'>
  ): Promise<Pick<VerificationCodeModel, 'id' | 'email' | 'code' | 'type' | 'expiresAt'>> {
    const { email, code, type } = data

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

      const clientRoleId = await this.roleRepository.getClientRoleId()
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
        roleId: user.role.id,
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
    const essentialUserExistenceChecks = [
      TypeOfVerificationCode.LOGIN,
      TypeOfVerificationCode.DISABLE_2FA,
      TypeOfVerificationCode.FORGOT_PASSWORD,
    ]

    const user = await this.userRepository.findUnique<Pick<UserModel, 'id'>>({ email, deletedAt: null }, { id: true })

    if (type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException
    } else if (essentialUserExistenceChecks.includes(type as (typeof essentialUserExistenceChecks)[number]) && !user) {
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
      })().catch((err) => {
        console.error('🫢 Error sending OTP:', err)
      })
    })
  }

  async login(payload: LoginBody & DevicePayload): Promise<LoginDataRes> {
    const user = await this.userRepository.findUniqueIncludeRole<Pick<UserModel, 'id' | 'password' | 'totpSecret'>>(
      { email: payload.email, deletedAt: null },
      { id: true, password: true, totpSecret: true }
    )
    if (!user) {
      throw EmailOrPasswordIncorrectException('email')
    }

    const isPasswordCorrect = await this.hashingService.compare(payload.password, user.password)
    if (!isPasswordCorrect) {
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
          email: payload.email,
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
      roleId: user.role.id,
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
          role: { name: roleName, id: roleId },
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
      // Kiểm tra sự tồn tại của email
      const { id: userId } = await this.userService.getValidatedUser<Pick<UserModel, 'id'>>(
        { email, deletedAt: null },
        { select: { id: true }, shouldRequireActiveUser: false, notFoundException: EmailDoesNotExistException }
      )

      // Kiểm tra mã xác minh
      await this.verifyVerificationCode({ email, code, type: TypeOfVerificationCode.FORGOT_PASSWORD })

      const hashedPassword = await this.hashingService.hash(password)

      // Cập nhật mật khẩu mới cho user và xóa mã xác minh
      await Promise.all([
        this.userRepository.update({ email, deletedAt: null }, { password: hashedPassword, updatedById: userId }),
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
    try {
      // Bước 1. Kiểm tra thông tin user
      const user = await this.userService.getValidatedUser<Pick<UserModel, 'email' | 'totpSecret'>>(
        { id: userId, deletedAt: null },
        { select: { email: true, totpSecret: true } }
      )

      // Bước 2. Kiểm tra user đã bật 2FA chưa
      if (user.totpSecret) {
        throw TwoFactorAuthAlreadyEnabledException
      }

      // Bước 3. Tạo secret key và uri 2FA
      const { secret, uri } = this.twoFactorAuthService.generateTOTPSecret(user.email)

      // Bước 4. Lưu secret key vào db
      await this.userRepository.update({ id: userId, deletedAt: null }, { totpSecret: secret, updatedById: userId })

      // Bước 5. Trả về secret key và uri 2FA
      return { secret, uri }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw UserNotFoundException
      }
      throw error
    }
  }

  async disableTwoFactorAuth(payload: Disable2FABody & { userId: AccessTokenPayload['userId'] }): Promise<void> {
    const { userId, code, totpCode } = payload

    try {
      // Bước 1. Kiểm tra thông tin user
      const user = await this.userService.getValidatedUser<Pick<UserModel, 'email' | 'totpSecret'>>(
        {
          id: userId,
          deletedAt: null,
        },
        { select: { email: true, totpSecret: true } }
      )

      // Bước 2. Kiểm tra user đã bật 2FA chưa
      if (!user.totpSecret) {
        throw TwoFactorAuthNotEnabledException
      }

      // Bước 3. Kiểm tra totpCode hoặc code
      // Không cần kiểm tra trường hợp cả 2 không có hoặc cả 2 đều có
      // Vì zod đã validate những case đó
      if (totpCode) {
        const isValid = this.twoFactorAuthService.verifyTOTP(totpCode, user.totpSecret)

        if (!isValid) {
          throw InvalidTOTPCodeException
        }
      } else if (code) {
        await this.verifyVerificationCode({ email: user.email, code, type: TypeOfVerificationCode.DISABLE_2FA })
      }

      // Bước 4. Xóa secret key trong db
      await this.userRepository.update({ id: userId, deletedAt: null }, { totpSecret: null, updatedById: userId })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw UserNotFoundException
      }
      throw error
    }
  }
}
