import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

import { ErrorMessages } from 'src/routes/permission/permission.constant'

export const PermissionAlreadyExistsException = new UnprocessableEntityException([
  {
    message: ErrorMessages.PERMISSION_ALREADY_EXISTS,
    path: 'path',
  },
  {
    message: ErrorMessages.PERMISSION_ALREADY_EXISTS,
    path: 'method',
  },
])

export const PermissionNotFoundException = new NotFoundException(ErrorMessages.PERMISSION_NOT_FOUND)
