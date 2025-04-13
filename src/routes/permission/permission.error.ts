import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

import { ErrorMessages } from 'src/routes/permission/permission.constant'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'

export const PermissionAlreadyExistsException = new UnprocessableEntityException({
  message: CommonErrorMessages.GENERIC,
  errors: [
    {
      message: ErrorMessages.PERMISSION_ALREADY_EXISTS,
      path: 'path',
      location: 'body',
    },
    {
      message: ErrorMessages.PERMISSION_ALREADY_EXISTS,
      path: 'method',
      location: 'body',
    },
  ],
})

export const PermissionNotFoundException = new NotFoundException(ErrorMessages.PERMISSION_NOT_FOUND)
