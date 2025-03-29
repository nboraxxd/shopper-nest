import { Injectable } from '@nestjs/common'

import { User } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

import { RegisterBody, RegisterDataRes, VerificationCode } from 'src/routes/auth/auth.model'

@Injectable()
export class AuthRepesitory {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    user: Omit<RegisterBody, 'confirmPassword' | 'code'> & Pick<User, 'roleId' | 'status'>
  ): Promise<RegisterDataRes> {
    const { email, name, password, phoneNumber, roleId, status } = user

    return this.prismaService.user.create({
      data: {
        email,
        password,
        name,
        phoneNumber,
        roleId,
        status,
      },
      omit: {
        password: true,
        totpSecret: true,
        createdById: true,
        updatedById: true,
        deletedAt: true,
      },
    })
  }

  async upsertVerificationCode(
    payload: Pick<VerificationCode, 'email' | 'type' | 'code' | 'expiresAt'>
  ): Promise<void> {
    const { email, code, expiresAt } = payload

    const result = await this.prismaService.verificationCode.upsert({
      where: { email },
      create: payload,
      update: { code, expiresAt },
    })

    console.log('🔥 ~ AuthRepesitory ~ createVerificationCode ~ OTP:', result)
  }

  findUniqueVerificationCode(
    where:
      | Pick<VerificationCode, 'email'>
      | Pick<VerificationCode, 'id'>
      | Pick<VerificationCode, 'code' | 'email' | 'type'>
  ): Promise<VerificationCode | null> {
    return this.prismaService.verificationCode.findUnique({ where })
  }

  async deleteVerificationCode(
    where: Pick<VerificationCode, 'id'> | Pick<VerificationCode, 'email' | 'code' | 'type'>
  ): Promise<void> {
    await this.prismaService.verificationCode.delete({ where })
  }
}
