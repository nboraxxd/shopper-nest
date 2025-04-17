import omit from 'lodash/omit'
import { Injectable } from '@nestjs/common'

import { RoleModel } from 'src/shared/models/role.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { PermissionModel } from 'src/shared/models/permission.model'
import { GetUserProfileQuery, UserIdentifier, UserModel } from 'src/shared/models/user.model'

type UserPermissions = {
  permissions?: Array<Pick<PermissionModel, 'id' | 'method' | 'path' | 'module'>>
}

type UserRolePermissions = Omit<UserModel, 'password' | 'roleId'> & {
  role?: Pick<RoleModel, 'id' | 'name'> & UserPermissions
} & UserPermissions

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(
    where: UserIdentifier,
    select?: Partial<Record<keyof UserModel, boolean>>
  ): Promise<UserModel | null> {
    return this.prismaService.user.findUnique({ where, select })
  }

  async findUniqueIncludeRole(where: UserIdentifier): Promise<(UserModel & { role: RoleModel }) | null> {
    return this.prismaService.user.findUnique({ where, include: { role: true } })
  }

  async findUniqueIncludeRolePermissions(
    where: UserIdentifier,
    include: Record<NonNullable<GetUserProfileQuery['include']>[number], boolean>
  ): Promise<UserRolePermissions | null> {
    const user = await this.prismaService.user.findUnique({
      where,
      omit: { password: true },
      include: {
        role: include.role
          ? {
              include: include.permissions
                ? {
                    permissions: {
                      where: { deletedAt: null },
                      select: { id: true, method: true, path: true, module: true },
                    },
                  }
                : undefined,
              // ở đây dùng omit thay vì dùng select
              // vì select không thể dùng được với include
              omit: {
                description: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                createdById: true,
                updatedById: true,
                deletedById: true,
              },
            }
          : undefined,
      },
    })

    if (!user) return null

    if (!include.role && include.permissions) {
      const role = await this.prismaService.role.findUnique({
        where: { id: user.roleId, deletedAt: null },
        select: {
          permissions: {
            where: { deletedAt: null },
            select: { id: true, method: true, path: true, module: true },
          },
        },
      })

      return {
        ...omit(user, 'roleId'),
        permissions: role?.permissions ?? [],
      }
    }

    return user
  }

  async update(
    where: UserIdentifier,
    data: Partial<Omit<UserModel, 'id'>>
  ): Promise<
    Pick<
      UserModel,
      'id' | 'name' | 'email' | 'phoneNumber' | 'avatar' | 'status' | 'createdAt' | 'updatedAt' | 'totpSecret'
    >
  > {
    return this.prismaService.user.update({
      where,
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        totpSecret: true,
      },
    })
  }
}
