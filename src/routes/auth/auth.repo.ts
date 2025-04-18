import { Injectable } from '@nestjs/common'

import { UserModel } from 'src/shared/models/user.model'
import { RoleModel } from 'src/shared/models/role.model'
import { PrismaService } from 'src/shared/services/prisma.service'

import { DeviceModel, RefreshTokenModel, VerificationCodeModel } from 'src/routes/auth/auth.model'

type VerificationCodeIdentifier =
  | Pick<VerificationCodeModel, 'id'>
  | { email_code_type: Pick<VerificationCodeModel, 'email' | 'code' | 'type'> }

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async insertUserIncludeRole(
    user: Pick<UserModel, 'email' | 'name' | 'password' | 'roleId' | 'status'> & Partial<Pick<UserModel, 'avatar'>>
  ): Promise<Pick<UserModel, 'id' | 'email' | 'name' | 'status'> & { role: Pick<RoleModel, 'id' | 'name'> }> {
    const { email, name, password, avatar, roleId, status } = user

    return this.prismaService.user.create({
      data: {
        email,
        password,
        name,
        avatar: avatar ?? null,
        roleId,
        status,
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        role: { select: { id: true, name: true } },
      },
    })
  }

  async upsertVerificationCode(
    payload: Pick<VerificationCodeModel, 'email' | 'type' | 'code' | 'expiresAt'>
  ): Promise<void> {
    const { email, code, type, expiresAt } = payload

    await this.prismaService.verificationCode.upsert({
      where: { email_code_type: { email, code, type } },
      create: payload,
      update: { code, expiresAt },
    })
  }

  findUniqueVerificationCode(
    where: VerificationCodeIdentifier
  ): Promise<Pick<VerificationCodeModel, 'id' | 'email' | 'code' | 'type' | 'expiresAt'> | null> {
    return this.prismaService.verificationCode.findUnique({
      where,
      select: { id: true, email: true, code: true, type: true, expiresAt: true },
    })
  }

  async deleteVerificationCode(where: VerificationCodeIdentifier): Promise<void> {
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

  async findUniqueRefreshTokenIncludeUserRole(where: Pick<RefreshTokenModel, 'token'>): Promise<
    | (Pick<RefreshTokenModel, 'deviceId' | 'createdAt' | 'expiresAt'> & {
        user: { role: Pick<RoleModel, 'id' | 'name'> }
      })
    | null
  > {
    return this.prismaService.refreshToken.findUnique({
      where,
      select: {
        user: { select: { role: { select: { id: true, name: true } } } },
        deviceId: true,
        createdAt: true,
        expiresAt: true,
      },
    })
  }

  async updateDevice(id: number, data: Partial<DeviceModel>): Promise<DeviceModel> {
    return this.prismaService.device.update({ where: { id }, data })
  }

  async deleteRefreshToken(token: string): Promise<Pick<RefreshTokenModel, 'deviceId'>> {
    return this.prismaService.refreshToken.delete({ where: { token }, select: { deviceId: true } })
  }
}
