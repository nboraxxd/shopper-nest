import { Injectable } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  async getClientRoleId() {
    // Nếu clientRoleId đã có trong cache, trả về ngay
    if (this.clientRoleId) {
      return this.clientRoleId
    }

    // Truy vấn database để lấy roleId của role "client"
    const role = await this.prismaService.role.findUniqueOrThrow({
      where: { name: RoleName.Client },
    })

    // Lưu giá trị vào cache và trả về
    this.clientRoleId = role.id
    return role.id
  }
}
