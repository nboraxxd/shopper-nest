import { Injectable } from '@nestjs/common'

import { PermissionModel } from 'src/shared/models/permission.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async listExistingIds(ids: PermissionModel['id'][]): Promise<PermissionModel['id'][]> {
    const permissions = await this.prismaService.permission.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true },
    })

    return permissions.map((permission) => permission.id)
  }
}
