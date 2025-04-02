import ms from 'ms'
import { addMilliseconds } from 'date-fns'
import { Injectable, UnauthorizedException } from '@nestjs/common'

import envConfig from 'src/shared/env-config'
import { generateOTP } from 'src/shared/utils'
import { TokenService } from 'src/shared/services/token.service'
import { MailingService } from 'src/shared/services/mailing.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { JsonWebTokenException } from 'src/shared/models/shared-error.model'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { AccessTokenPayloadSign, RefreshTokenPayload } from 'src/shared/types/jwt.type'
import { TypeOfVerificationCode, UserStatus } from 'src/shared/constants/shared-auth.constant'
import { isJsonWebTokenError, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/utils/errors'

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
  VerificationCodeModel,
} from 'src/routes/auth/auth.model'
import {
  DuplicateRefreshTokenException,
  EmailAlreadyExistsException,
  EmailDoesNotExistException,
  EmailOrPasswordIncorrectException,
  ExpiredOTPException,
  InvalidOTPException,
  RefreshTokenNotFoundException,
} from 'src/routes/auth/error.model'
import { AuthRepesitory } from 'src/routes/auth/auth.repo'
import { RolesService } from 'src/routes/auth/roles.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly mailingService: MailingService,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
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
      throw InvalidOTPException
    }

    if (verificationModel.expiresAt < new Date()) {
      throw ExpiredOTPException
    }

    return verificationModel
  }

  async register(payload: RegisterBody & DevicePayload): Promise<RegisterDataRes> {
    const { email, name, password, phoneNumber, code, ip, userAgent } = payload

    try {
      await this.verifyVerificationCode({ email, code, type: TypeOfVerificationCode.REGISTER })

      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(password)

      const [user] = await Promise.all([
        this.authRepository.insertUserIncludeRole({
          email,
          name,
          password: hashedPassword,
          phoneNumber,
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
    const user = await this.sharedUserRepository.findUnique({ email })

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
    const user = await this.sharedUserRepository.findUniqueIncludeRole({ email: payload.email })
    if (!user) {
      throw EmailOrPasswordIncorrectException('email')
    }

    const isPasswordValid = await this.hashingService.compare(payload.password, user.password)
    if (!isPasswordValid) {
      throw EmailOrPasswordIncorrectException('email')
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
        this.sharedUserRepository.findUnique({ email }),
        this.verifyVerificationCode({ email, code, type: TypeOfVerificationCode.FORGOT_PASSWORD }),
      ])

      if (!user) {
        throw EmailDoesNotExistException
      }

      const hashedPassword = await this.hashingService.hash(password)

      // Cập nhật mật khẩu mới cho user và xóa mã xác minh
      await Promise.all([
        this.sharedUserRepository.update({ email }, { password: hashedPassword }),
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
}
