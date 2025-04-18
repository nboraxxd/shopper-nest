import { Injectable } from '@nestjs/common'

import { RoleModel } from 'src/shared/models/role.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { PermissionModel } from 'src/shared/models/permission.model'
import { GetUserProfileQuery, UserIdentifier, UserModel } from 'src/shared/models/user.model'

type UserData = Pick<
  UserModel,
  'id' | 'name' | 'email' | 'phoneNumber' | 'avatar' | 'totpSecret' | 'status' | 'createdAt' | 'updatedAt'
>

type UserRole = Pick<RoleModel, 'id' | 'name'>

type UserPermissions = Array<Pick<PermissionModel, 'id' | 'method' | 'path' | 'module'>>

type UserFromPrisma = UserData & {
  role?: UserRole & {
    permissions?: UserPermissions
  }
}

type UserRolePermissions = UserData & {
  role?: UserRole
} & {
  permissions?: UserPermissions
}

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique<T>(where: UserIdentifier, select?: Partial<Record<keyof UserModel, boolean>>): Promise<T | null> {
    return this.prismaService.user.findUnique({ where, select }) as Promise<T | null>
  }

  async findUniqueIncludeRole<T>(
    where: UserIdentifier,
    select?: Partial<Record<keyof UserModel, boolean>>
  ): Promise<(T & { role: Pick<RoleModel, 'id' | 'name'> }) | null> {
    if (select) {
      return this.prismaService.user.findUnique({
        where,
        select: {
          ...select,
          role: { select: { id: true, name: true } },
        },
      }) as Promise<(T & { role: Pick<RoleModel, 'id' | 'name'> }) | null>
    }

    return this.prismaService.user.findUnique({
      where,
      include: {
        role: { select: { id: true, name: true } },
      },
    }) as Promise<(T & { role: Pick<RoleModel, 'id' | 'name'> }) | null>
  }

  async findUniqueIncludeRolePermissions(
    where: UserIdentifier,
    include: Record<NonNullable<GetUserProfileQuery['include']>[number], boolean>
  ): Promise<UserRolePermissions | null> {
    const user = (await this.prismaService.user.findUnique({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        totpSecret: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        role:
          include.role || include.permissions
            ? {
                select: {
                  id: true,
                  name: true,
                  permissions: include.permissions
                    ? {
                        where: { deletedAt: null },
                        select: { id: true, method: true, path: true, module: true },
                      }
                    : undefined,
                },
              }
            : undefined,
      },
    })) as UserFromPrisma

    if (!user) return null

    const { role, ...userInfo } = user

    const result: UserRolePermissions = {
      ...userInfo,
    }

    if (include.role && role) {
      result.role = {
        id: role.id,
        name: role.name,
      }
    }

    if (include.permissions && role) {
      result.permissions = role.permissions || []
    }

    return result
  }

  async update(where: UserIdentifier, data: Partial<Omit<UserModel, 'id'>>): Promise<UserData> {
    return this.prismaService.user.update({
      where,
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        totpSecret: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }
}
