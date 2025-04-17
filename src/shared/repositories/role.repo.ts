import { Injectable } from '@nestjs/common'

import { GetRoleDataRes, RoleModel } from 'src/shared/models/role.model'
import { PermissionModel } from 'src/shared/models/permission.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findActiveRole(
    data: Pick<RoleModel, 'id'> & Pick<PermissionModel, 'method' | 'path'>
  ): Promise<GetRoleDataRes | null> {
    const { id, method, path } = data

    return this.prismaService.role.findUnique({
      where: { id, deletedAt: null },
      omit: { deletedAt: true, createdById: true, updatedById: true, deletedById: true },
      include: {
        permissions: {
          where: { deletedAt: null, path, method },
          select: { id: true, name: true, method: true, path: true, module: true },
        },
      },
    })
  }
}
