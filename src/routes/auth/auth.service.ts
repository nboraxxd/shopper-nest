import ms from 'ms'
import { addMilliseconds } from 'date-fns'
import { Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common'

import envConfig from 'src/shared/env-config'
import { TokenService } from 'src/shared/services/token.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { generateOTP, isUniqueConstraintPrismaError } from 'src/shared/helper'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'

import { AuthRepesitory } from 'src/routes/auth/auth.repo'
import { RolesService } from 'src/routes/auth/roles.service'
import { RegisterBody, RegisterDataRes, SendOTPBody } from 'src/routes/auth/auth.model'

@Injectable()
export class AuthService {
  constructor(
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    private readonly authRepesitory: AuthRepesitory
  ) {}

  async register({ email, name, password, phoneNumber }: RegisterBody): Promise<RegisterDataRes> {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(password)

      const user = await this.authRepesitory.createUser({
        email,
        name,
        password: hashedPassword,
        phoneNumber,
        roleId: clientRoleId,
      })

      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new UnprocessableEntityException({
          message: 'Error occurred',
          errors: [{ message: 'Email already exists', path: 'email' }],
        })
      }
      throw new InternalServerErrorException()
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

    const code = generateOTP()

    await this.authRepesitory.createVerificationCode({
      email,
      code,
      type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as ms.StringValue)),
    })
  }
}
