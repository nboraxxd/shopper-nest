import { Injectable } from '@nestjs/common'

import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { PagedResponse } from 'src/shared/types/response.type'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/utils/errors'

import {
  CreatePermissionBody,
  GetPermissionDataRes,
  PermissionParam,
  GetPermissionsDataRes,
  GetPermissionsQuery,
  UpdatePermissionBody,
} from 'src/routes/permission/permission.model'
import { PermissionRepository } from 'src/routes/permission/permission.repo'
import { PermissionAlreadyExistsException, PermissionNotFoundException } from 'src/routes/permission/permission.error'

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async list({ limit, page }: GetPermissionsQuery): Promise<PagedResponse<GetPermissionsDataRes>> {
    const result = await this.permissionRepository.list({ limit, page })

    return result
  }

  async detail(id: PermissionParam['id']): Promise<GetPermissionDataRes> {
    const result = await this.permissionRepository.findById(id)

    if (!result) {
      throw PermissionNotFoundException
    }

    return result
  }

  async create(payload: CreatePermissionBody & { userId: AccessTokenPayload['userId'] }): Promise<void> {
    const { name, path, method, userId, description, module } = payload

    try {
      await this.permissionRepository.create({ name, path, method, description, module, createdById: userId })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async update(
    id: PermissionParam['id'],
    payload: UpdatePermissionBody & { userId: AccessTokenPayload['userId'] }
  ): Promise<void> {
    const { userId, description, method, name, path, module } = payload

    try {
      await this.permissionRepository.update(id, { name, path, method, description, module, updatedById: userId })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundException
      } else if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async delete(
    id: PermissionParam['id'],
    userId: AccessTokenPayload['userId'],
    isHard: boolean = false
  ): Promise<void> {
    try {
      await this.permissionRepository.delete(id, userId, isHard)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundException
      }
      throw error
    }
  }
}
