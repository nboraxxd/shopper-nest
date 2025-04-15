import { Injectable } from '@nestjs/common'

import { GetRoleDataRes, RoleModel } from 'src/shared/models/role.model'
import { PagedResponse } from 'src/shared/types/response.type'
import { PrismaService } from 'src/shared/services/prisma.service'

import { GetRolesDataRes, GetRolesQuery, RoleParam, UpdateRoleBody } from 'src/routes/role/role.model'

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list({ limit, page, isActive }: GetRolesQuery): Promise<PagedResponse<GetRolesDataRes>> {
    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({ where: { deletedAt: null, isActive } }),
      this.prismaService.role.findMany({
        where: { deletedAt: null, isActive },
        omit: { deletedAt: true, createdById: true, updatedById: true, deletedById: true },
        take: limit,
        skip: (page - 1) * limit,
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

  findById(id: RoleParam['id']): Promise<GetRoleDataRes | null> {
    return this.prismaService.role.findUnique({
      where: { id, deletedAt: null },
      omit: { deletedAt: true, createdById: true, updatedById: true, deletedById: true },
      include: {
        permissions: {
          where: { deletedAt: null },
          omit: { deletedAt: true, createdById: true, updatedById: true, deletedById: true },
        },
      },
    })
  }

  async create(
    data: Pick<RoleModel, 'name' | 'createdById'> & Partial<Pick<RoleModel, 'description' | 'isActive'>>
  ): Promise<void> {
    const { createdById, description, isActive, name } = data

    await this.prismaService.role.create({
      data: { name, description, isActive, createdById },
    })
  }

  async update(id: RoleParam['id'], data: Pick<RoleModel, 'updatedById'> & UpdateRoleBody): Promise<void> {
    const { updatedById, description, isActive, name, permissionIds } = data

    await this.prismaService.role.update({
      where: { id, deletedAt: null },
      data: {
        name,
        description,
        isActive,
        permissions: permissionIds ? { set: permissionIds.map((id) => ({ id })) } : undefined,
        updatedById,
      },
    })
  }

  async delete(id: RoleParam['id'], deletedById: RoleModel['deletedById'], isHard: boolean = false): Promise<void> {
    if (isHard) {
      await this.prismaService.role.delete({
        where: { id },
      })
    } else {
      await this.prismaService.role.update({
        where: { id, deletedAt: null },
        data: { deletedById, deletedAt: new Date() },
      })
    }
  }
}
