import { Injectable } from '@nestjs/common'

import { UserModel } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

import { DeviceModel, RefreshTokenModel, RegisterBody, RoleModel, VerificationCode } from 'src/routes/auth/auth.model'

@Injectable()
export class AuthRepesitory {
  constructor(private readonly prismaService: PrismaService) {}

  async insertUserIncludeRole(
    user: Omit<RegisterBody, 'confirmPassword' | 'code'> & Pick<UserModel, 'roleId' | 'status'>
  ): Promise<
    Omit<UserModel, 'password' | 'totpSecret' | 'createdById' | 'updatedById' | 'deletedAt'> & { role: RoleModel }
  > {
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
      include: { role: true },
    })
  }

  async findUniqueUserIncludeRole(
    where: Pick<UserModel, 'id'> | Pick<UserModel, 'email'>
  ): Promise<(UserModel & { role: RoleModel }) | null> {
    return this.prismaService.user.findUnique({ where, include: { role: true } })
  }

  async upsertVerificationCode(
    payload: Pick<VerificationCode, 'email' | 'type' | 'code' | 'expiresAt'>
  ): Promise<void> {
    const { email, code, expiresAt } = payload

    await this.prismaService.verificationCode.upsert({
      where: { email },
      create: payload,
      update: { code, expiresAt },
    })
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

  insertDevice(
    payload: Pick<DeviceModel, 'userId' | 'ip' | 'userAgent'> & Partial<Pick<DeviceModel, 'isActive' | 'lastActive'>>
  ): Promise<DeviceModel> {
    const { ip, userAgent, userId, isActive, lastActive } = payload

    return this.prismaService.device.create({
      data: {
        ip,
        userAgent,
        userId,
        isActive,
        lastActive,
      },
    })
  }

  async insertRefreshToken(payload: Omit<RefreshTokenModel, 'createdAt'>): Promise<void> {
    const { expiresAt, deviceId, token, userId } = payload

    await this.prismaService.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        deviceId,
      },
    })
  }
}
