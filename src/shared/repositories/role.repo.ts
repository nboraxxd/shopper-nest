import { Injectable } from '@nestjs/common'

import { RoleModel } from 'src/shared/models/role.model'
import { PermissionModel } from 'src/shared/models/permission.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { NotFoundClientRoleException } from 'src/routes/auth/auth.error'
import { RoleName } from 'src/shared/constants/role.constant'

@Injectable()
export class RoleRepository {
  private clientRoleId: number | null = null
  private adminRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  findRoleWithPermission(
    data: Pick<RoleModel, 'id'> & Pick<PermissionModel, 'method' | 'path'>
  ): Promise<
    | (Pick<RoleModel, 'id' | 'name' | 'isActive'> & { permissions: Pick<PermissionModel, 'id' | 'method' | 'path'>[] })
    | null
  > {
    const { id, method, path } = data

    return this.prismaService.role.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        isActive: true,
        permissions: {
          where: { deletedAt: null, path, method },
          select: {
            id: true,
            method: true,
            path: true,
          },
        },
      },
    })
  }

  async findRoleByRoleName(
    roleName: string
  ): Promise<Pick<RoleModel, 'id' | 'name' | 'isActive' | 'createdAt' | 'updatedAt'>> {
    const roles = await this.prismaService.$queryRaw<
      Pick<RoleModel, 'id' | 'name' | 'isActive' | 'createdAt' | 'updatedAt'>[]
    >`
          SELECT "id", "name", "isActive", "createdAt", "updatedAt" FROM "Role" WHERE name = ${roleName} AND "deletedAt" IS NULL LIMIT 1;
          `

    if (roles.length === 0) {
      throw NotFoundClientRoleException
    }

    return roles[0]
  }

  async getClientRoleId() {
    // Nếu clientRoleId đã có trong cache, trả về ngay
    if (this.clientRoleId) {
      return this.clientRoleId
    }

    // Truy vấn database để lấy roleId của role "CLIENT"
    const role = await this.findRoleByRoleName(RoleName.Client)

    // Lưu giá trị vào cache và trả về
    this.clientRoleId = role.id
    return role.id
  }

  async getAdminRoleId() {
    // Nếu adminRoleId đã có trong cache, trả về ngay
    if (this.adminRoleId) {
      return this.adminRoleId
    }

    // Truy vấn database để lấy roleId của role "ADMIN"
    const role = await this.findRoleByRoleName(RoleName.Admin)

    // Lưu giá trị vào cache và trả về
    this.adminRoleId = role.id
    return role.id
  }
}
