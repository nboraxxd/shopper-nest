import { Injectable } from '@nestjs/common'

import { PagedResponse } from 'src/shared/types/response.type'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { PermissionRepository } from 'src/shared/repositories/permission.repo'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/utils/errors'
import { PermissionIdsNotFoundException, RoleNotFoundException } from 'src/shared/models/error.model'

import {
  CreateRoleBody,
  GetRoleDataRes,
  GetRolesDataRes,
  GetRolesQuery,
  RoleParam,
  UpdateRoleBody,
} from 'src/routes/role/role.model'
import { RoleRepository } from 'src/routes/role/role.repo'
import { RoleName } from 'src/shared/constants/role.constant'
import { ProhibitedBaseRoleActionException, RoleAlreadyExistsException } from 'src/routes/role/role.error'

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository
  ) {}

  private async verifyRole(id: RoleParam['id']): Promise<void> {
    const role = await this.roleRepository.findById(id)

    if (!role) {
      throw RoleNotFoundException
    }

    const baseRoles: Array<string> = [RoleName.Admin, RoleName.Seller, RoleName.Client]

    // Do not allow anyone to edit or delete the ADMIN, SELLER, CLIENT roles
    if (baseRoles.includes(role.name)) {
      throw ProhibitedBaseRoleActionException
    }
  }

  async list({ limit, page, isActive }: GetRolesQuery): Promise<PagedResponse<GetRolesDataRes>> {
    const result = await this.roleRepository.list({ limit, page, isActive })

    return result
  }

  async detail(id: RoleParam['id']): Promise<GetRoleDataRes> {
    const result = await this.roleRepository.findById(id)

    if (!result) {
      throw RoleNotFoundException
    }

    return result
  }

  async create(payload: CreateRoleBody & { userId: AccessTokenPayload['userId'] }): Promise<void> {
    const { description, isActive, name, userId } = payload

    try {
      await this.roleRepository.create({ name, description, isActive, createdById: userId })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async update(id: RoleParam['id'], payload: UpdateRoleBody & { userId: AccessTokenPayload['userId'] }): Promise<void> {
    const { userId, description, isActive, name, permissionIds } = payload

    try {
      await this.verifyRole(id)

      if (permissionIds && permissionIds.length > 0) {
        const existingPermissionIds = await this.permissionRepository.listExistingIds(permissionIds)
        const existingPermissionSet = new Set(existingPermissionIds)

        const notFoundPermissionIds = permissionIds.filter((id) => !existingPermissionSet.has(id))

        if (notFoundPermissionIds.length > 0) {
          throw PermissionIdsNotFoundException(notFoundPermissionIds)
        }
      }

      await this.roleRepository.update(id, { name, description, isActive, permissionIds, updatedById: userId })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RoleNotFoundException
      } else if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async delete(id: RoleParam['id'], userId: AccessTokenPayload['userId'], isHard: boolean = false): Promise<void> {
    try {
      await this.verifyRole(id)

      await this.roleRepository.delete(id, userId, isHard)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RoleNotFoundException
      }
      throw error
    }
  }
}
