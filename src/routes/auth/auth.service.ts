import { Injectable, InternalServerErrorException } from '@nestjs/common'

import { TokenService } from 'src/shared/services/token.service'
import { isUniqueConstraintPrismaError } from 'src/shared/helper'
import { PrismaService } from 'src/shared/services/prisma.service'
import { HashingService } from 'src/shared/services/hashing.service'

import { RegisterBodyDto } from 'src/routes/auth/auth.dto'
import { RolesService } from 'src/routes/auth/roles.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService
  ) {}

  async register(body: RegisterBodyDto) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)

      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
          phoneNumber: body.phoneNumber,
          roleId: clientRoleId,
        },
        omit: {
          password: true,
          totpSecret: true,
        },
      })

      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new Error('Email đã tồn tại')
      }
      throw new InternalServerErrorException()
    }
  }
}
