import { Injectable } from '@nestjs/common'

import { RoleModel } from 'src/shared/models/role.model'
import { RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

import { NotFoundClientRoleException } from 'src/routes/auth/auth.error'

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  async getClientRoleId() {
    // Nếu clientRoleId đã có trong cache, trả về ngay
    if (this.clientRoleId) {
      return this.clientRoleId
    }

    // Truy vấn database để lấy roleId của role "CLIENT"
    const response = await this.prismaService.$queryRaw<RoleModel[]>`
      SELECT * FROM "Role" WHERE name = ${RoleName.Client} AND "deletedAt" IS NULL LIMIT 1;
      `

    if (response.length === 0) {
      throw NotFoundClientRoleException
    }

    // Lưu giá trị vào cache và trả về
    const roleId = response[0].id
    this.clientRoleId = roleId
    return roleId
  }
}
