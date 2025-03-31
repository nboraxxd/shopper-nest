import ms from 'ms'
import { addMilliseconds } from 'date-fns'
import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'

import {
  generateOTP,
  isJsonWebTokenError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from 'src/shared/helper'
import envConfig from 'src/shared/env-config'
import { TokenService } from 'src/shared/services/token.service'
import { MailingService } from 'src/shared/services/mailing.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { AccessTokenPayloadSign, RefreshTokenPayload } from 'src/shared/types/jwt.type'
import { TypeOfVerificationCode, UserStatus } from 'src/shared/constants/auth.constant'

import {
  DevicePayload,
  LoginBody,
  LoginDataRes,
  LogoutBody,
  RefreshTokenBody,
  RefreshTokenDataRes,
  RegisterBody,
  RegisterDataRes,
  SendOTPBody,
} from 'src/routes/auth/auth.model'
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
        token: token,
        expiresAt: new Date(exp * 1000),
        deviceId,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new UnauthorizedException('Duplicate refresh token')
      }
      throw error
    }
  }

  async register(payload: RegisterBody & DevicePayload): Promise<RegisterDataRes> {
    const { email, name, password, phoneNumber, code, ip, userAgent } = payload

    try {
      const verificationCode = await this.authRepository.findUniqueVerificationCode({
        email,
        code,
        type: TypeOfVerificationCode.REGISTER,
      })

      if (!verificationCode) {
        throw new UnprocessableEntityException({
          message: 'Error occurred',
          errors: [{ message: 'Invalid code', path: 'code' }],
        })
      }

      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException({
          message: 'Error occurred',
          errors: [{ message: 'Code has expired', path: 'code' }],
        })
      }

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
        this.authRepository.deleteVerificationCode({ email, code, type: TypeOfVerificationCode.REGISTER }),
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
        throw new UnprocessableEntityException({
          message: 'Error occurred',
          errors: [{ message: 'Email already exists', path: 'email' }],
        })
      }
      throw error
    }
  }

  async sendOTP({ email, type }: SendOTPBody): Promise<void> {
    const user = await this.sharedUserRepository.findUnique({ email })

    if (type === 'REGISTER' && user) {
      throw new UnprocessableEntityException({
        message: 'Error occurred',
        errors: [{ message: 'Email already exists', path: 'email' }],
      })
    } else if (type === 'FORGOT_PASSWORD' && !user) {
      throw new UnprocessableEntityException({
        message: 'Error occurred',
        errors: [{ message: 'Email does not exist', path: 'email' }],
      })
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
    const user = await this.authRepository.findUniqueUserIncludeRole({ email: payload.email })
    if (!user) {
      throw new UnprocessableEntityException({
        message: 'Error occurred',
        errors: [{ message: 'Email or password is incorrect', path: 'email' }],
      })
    }

    const isPasswordValid = await this.hashingService.compare(payload.password, user.password)
    if (!isPasswordValid) {
      throw new UnprocessableEntityException({
        message: 'Error occurred',
        errors: [{ message: 'Email or password is incorrect', path: 'email' }],
      })
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
        throw new UnauthorizedException('Refresh token not found')
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
        throw new UnauthorizedException(error.message)
      } else if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token not found.')
      }
      throw error
    }
  }
}
