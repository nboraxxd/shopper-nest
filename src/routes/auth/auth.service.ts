import { Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common'

import { TokenService } from 'src/shared/services/token.service'
import { isUniqueConstraintPrismaError } from 'src/shared/helper'
import { HashingService } from 'src/shared/services/hashing.service'

import { AuthRepesitory } from 'src/routes/auth/auth.repo'
import { RolesService } from 'src/routes/auth/roles.service'
import { RegisterBody, RegisterRes } from 'src/routes/auth/auth.model'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    private readonly authRepesitory: AuthRepesitory
  ) {}

  async register({ email, name, password, phoneNumber }: RegisterBody): Promise<RegisterRes> {
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
}
