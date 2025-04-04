import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

import { CommonErrorMessages } from 'src/shared/constants/common.constant'

import { ErrorMessages } from 'src/routes/language/language.constant'

export const LanguageIdAlreadyExistsException = new UnprocessableEntityException({
  message: CommonErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.LANGUAGE_ID_ALREADY_EXISTS, path: 'id' }],
})

export const LanguageNotFoundException = new NotFoundException(ErrorMessages.LANGUAGE_NOT_FOUND)
