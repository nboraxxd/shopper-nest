import { UnprocessableEntityException } from '@nestjs/common'

import { CommonErrorMessages } from 'src/shared/constants/common.constant'

import { ErrorMessages } from 'src/routes/profile/profile.constant'

export const PasswordIncorrectException = new UnprocessableEntityException({
  message: CommonErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.PASSWORD_INCORRECT, path: 'password', location: 'body' }],
})
