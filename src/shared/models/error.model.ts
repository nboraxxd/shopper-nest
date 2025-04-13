import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'
import { PermissionModel } from 'src/shared/models/permission.model'

export const JsonWebTokenException = (errorMessage: string) => new UnauthorizedException(errorMessage)

export const RequiredAccessTokenException = new UnauthorizedException(CommonErrorMessages.REQUIRED_ACCESS_TOKEN)

export const InvalidAccessTokenException = new UnauthorizedException(CommonErrorMessages.INVALID_ACCESS_TOKEN)

export const DataNotFoundException = (message?: string) =>
  new NotFoundException(message || CommonErrorMessages.DATA_NOT_FOUND)

export const UserNotFoundException = new NotFoundException(CommonErrorMessages.USER_NOT_FOUND)

export const UserBlockedException = new BadRequestException(CommonErrorMessages.USER_BLOCKED)

export const PermissionIdsNotFoundException = (ids: PermissionModel['id'][]) =>
  new UnprocessableEntityException({
    message: CommonErrorMessages.GENERIC,
    errors: [{ message: CommonErrorMessages.PERMISSION_IDS_NOT_FOUND(ids), path: 'permissionIds', location: 'body' }],
  })
