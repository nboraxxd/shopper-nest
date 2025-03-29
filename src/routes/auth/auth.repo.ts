import { Injectable } from '@nestjs/common'

import { User } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

import { RegisterBody, RegisterDataRes, VerificationCode } from 'src/routes/auth/auth.model'

@Injectable()
export class AuthRepesitory {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(user: Omit<RegisterBody, 'confirmPassword'> & Pick<User, 'roleId'>): Promise<RegisterDataRes> {
    const { email, name, password, phoneNumber, roleId } = user

    return this.prismaService.user.create({
      data: {
        email,
        password,
        name,
        phoneNumber,
        roleId,
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

  async createVerificationCode(
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
}
