import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { PermissionModel } from 'src/shared/models/permission.model'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'

export const JsonWebTokenException = (errorMessage: string) => new UnauthorizedException(errorMessage)

export const RequiredAccessTokenException = new UnauthorizedException(CommonErrorMessages.ACCESS_TOKEN_REQUIRED)

export const InvalidAccessTokenException = new UnauthorizedException(CommonErrorMessages.ACCESS_TOKEN_INVALID)

export const DataNotFoundException = (message?: string) =>
  new NotFoundException(message || CommonErrorMessages.DATA_NOT_FOUND)

export const UserNotFoundException = new NotFoundException(CommonErrorMessages.USER_NOT_FOUND)

export const UserBlockedException = new ForbiddenException(CommonErrorMessages.USER_BLOCKED)

export const PermissionIdsNotFoundException = (ids: PermissionModel['id'][]) =>
  new UnprocessableEntityException({
    message: CommonErrorMessages.GENERIC,
    errors: [{ message: CommonErrorMessages.PERMISSION_IDS_NOT_FOUND(ids), path: 'permissionIds', location: 'body' }],
  })

export const RoleNotFoundException = new NotFoundException(CommonErrorMessages.ROLE_NOT_FOUND)

export const InsufficientPermissionException = new ForbiddenException(CommonErrorMessages.INSUFFICIENT_PERMISSION)
