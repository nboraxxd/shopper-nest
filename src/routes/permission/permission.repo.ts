import { Injectable } from '@nestjs/common'

import { PagedResponse } from 'src/shared/types/response.type'
import { PrismaService } from 'src/shared/services/prisma.service'
import { PermissionModel } from 'src/shared/models/permission.model'

import {
  GetPermissionDataRes,
  GetPermissionsDataRes,
  GetPermissionsQuery,
  PermissionParam,
} from 'src/routes/permission/permission.model'

@Injectable()
export class PermissionRepository {
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

  findById(id: PermissionParam['id']): Promise<GetPermissionDataRes | null> {
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
    id: PermissionParam['id'],
    data: Partial<Pick<PermissionModel, 'name' | 'path' | 'method' | 'description' | 'updatedById'>>
  ): Promise<void> {
    const { name, path, method, description, updatedById } = data

    await this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: { name, path, method, description, updatedById },
    })
  }

  async delete(
    id: PermissionParam['id'],
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
        data: { deletedById, deletedAt: new Date() },
      })
    }
  }
}
