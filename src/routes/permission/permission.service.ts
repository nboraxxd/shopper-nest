import { Injectable } from '@nestjs/common'
import { PermissionAlreadyExistsException, PermissionNotFoundException } from 'src/routes/permission/permission.error'
import {
  CreatePermissionBody,
  GetPermissionDataRes,
  PermissionParam,
  GetPermissionsDataRes,
  GetPermissionsQuery,
  UpdatePermissionBody,
} from 'src/routes/permission/permission.model'
import { PermissionRepesitory } from 'src/routes/permission/permission.repo'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { PagedResponse } from 'src/shared/types/response.type'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/utils/errors'

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepesitory: PermissionRepesitory) {}

  async list({ limit, page }: GetPermissionsQuery): Promise<PagedResponse<GetPermissionsDataRes>> {
    const result = await this.permissionRepesitory.list({ limit, page })

    return result
  }

  async detail(id: PermissionParam['id']): Promise<GetPermissionDataRes> {
    const result = await this.permissionRepesitory.findById(id)

    if (!result) {
      throw PermissionNotFoundException
    }

    return result
  }

  async create(payload: CreatePermissionBody & { userId: AccessTokenPayload['userId'] }): Promise<void> {
    const { name, path, method, userId } = payload

    try {
      await this.permissionRepesitory.create({ name, path, method, createdById: userId })
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
    const { userId, description, method, name, path } = payload

    try {
      await this.permissionRepesitory.update(id, { name, path, method, description, updatedById: userId })
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
      await this.permissionRepesitory.delete(id, userId, isHard)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundException
      }
      throw error
    }
  }
}
