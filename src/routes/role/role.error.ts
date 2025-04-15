import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common'

import { CommonErrorMessages } from 'src/shared/constants/common.constant'

import { ErrorMessages } from 'src/routes/role/role.constant'

export const RoleAlreadyExistsException = new UnprocessableEntityException({
  message: CommonErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.ROLE_ALREADY_EXISTS, path: 'path', location: 'body' }],
})

export const BaseRoleDeletionForbiddenException = new ForbiddenException(ErrorMessages.BASE_ROLE_DELETION_FORBIDDEN)

export const AdminRoleEditForbiddenException = new ForbiddenException(ErrorMessages.ADMIN_ROLE_EDIT_FORBIDDEN)
