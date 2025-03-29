import ms from 'ms'
import { addMilliseconds } from 'date-fns'
import { Injectable, UnprocessableEntityException } from '@nestjs/common'

import envConfig from 'src/shared/env-config'
import { TokenService } from 'src/shared/services/token.service'
import { MailingService } from 'src/shared/services/mailing.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { generateOTP, isUniqueConstraintPrismaError } from 'src/shared/helper'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { TypeOfVerificationCode, UserStatus } from 'src/shared/constants/auth.constant'

import { AuthRepesitory } from 'src/routes/auth/auth.repo'
import { RolesService } from 'src/routes/auth/roles.service'
import { RegisterBody, RegisterDataRes, SendOTPBody } from 'src/routes/auth/auth.model'

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

  async register({ email, name, password, phoneNumber, code }: RegisterBody): Promise<RegisterDataRes> {
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
        this.authRepository.createUser({
          email,
          name,
          password: hashedPassword,
          phoneNumber,
          roleId: clientRoleId,
          status: UserStatus.ACTIVE,
        }),
        this.authRepository.deleteVerificationCode({ email, code, type: TypeOfVerificationCode.REGISTER }),
      ])

      return user
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
}
