import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

import { CommonErrorMessages } from 'src/shared/constants/common.constant'

import { ErrorMessages } from 'src/routes/role/role.constant'

export const RoleAlreadyExistsException = new UnprocessableEntityException({
  message: CommonErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.ROLE_ALREADY_EXISTS, path: 'path', location: 'body' }],
})

export const RoleNotFoundException = new NotFoundException(ErrorMessages.ROLE_NOT_FOUND)
