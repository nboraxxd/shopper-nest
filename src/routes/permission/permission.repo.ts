import { Injectable } from '@nestjs/common'
import {
  GetPermissionDataRes,
  GetPermissionsDataRes,
  GetPermissionsQuery,
  PermissionModel,
} from 'src/routes/permission/permission.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { PagedResponse } from 'src/shared/types/response.type'

@Injectable()
export class PermissionRepesitory {
  constructor(private readonly prismaService: PrismaService) {}

  async list({ limit, page }: GetPermissionsQuery): Promise<PagedResponse<GetPermissionsDataRes>> {
    const skip = (page - 1) * limit
    const take = limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where: { deletedAt: null },
      }),
      this.prismaService.permission.findMany({
        where: { deletedAt: null },
        omit: { deletedAt: true, deletedById: true },
        skip,
        take,
      }),
    ])

    return {
      data,
      pagination: {
        currentPage: page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    }
  }

  findById(id: PermissionModel['id']): Promise<GetPermissionDataRes | null> {
    return this.prismaService.permission.findUnique({
      where: { id, deletedAt: null },
      omit: { deletedAt: true, deletedById: true },
    })
  }

  async create({
    createdById,
    method,
    name,
    path,
  }: Pick<PermissionModel, 'name' | 'path' | 'method' | 'createdById'>): Promise<void> {
    await this.prismaService.permission.create({
      data: { name, path, method, createdById },
    })
  }

  async update(
    id: PermissionModel['id'],
    data: Partial<Pick<PermissionModel, 'name' | 'path' | 'method' | 'description' | 'updatedById'>>
  ): Promise<void> {
    const { name, path, method, description, updatedById } = data

    await this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: { name, path: path, method: method, description: description, updatedById },
    })
  }

  async delete(
    id: PermissionModel['id'],
    deletedById: PermissionModel['deletedById'],
    isHard: boolean = false
  ): Promise<void> {
    if (isHard) {
      await this.prismaService.permission.delete({
        where: { id },
      })
    } else {
      await this.prismaService.permission.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date(), deletedById },
      })
    }
  }
}
