import { BadRequestException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'

import { ErrorMessages } from 'src/routes/auth/auth.constant'

export const InvalidOTPException = new UnprocessableEntityException({
  message: ErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.INVALID_OTP, path: 'code' }],
})

export const ExpiredOTPException = new UnprocessableEntityException({
  message: ErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.EXPIRED_OTP, path: 'code' }],
})

export const EmailAlreadyExistsException = new UnprocessableEntityException({
  message: ErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.EMAIL_ALREADY_EXISTS, path: 'email' }],
})

export const EmailDoesNotExistException = new UnprocessableEntityException({
  message: ErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.EMAIL_DOES_NOT_EXIST, path: 'email' }],
})

export const EmailOrPasswordIncorrectException = (path: string) =>
  new UnprocessableEntityException({
    message: ErrorMessages.GENERIC,
    errors: [{ message: ErrorMessages.EMAIL_OR_PASSWORD_INCORRECT, path }],
  })

export const DuplicateRefreshTokenException = new UnprocessableEntityException(ErrorMessages.DUPLICATE_REFRESH_TOKEN)

export const RefreshTokenNotFoundException = new UnauthorizedException(ErrorMessages.REFRESH_TOKEN_NOT_FOUND)

export const TwoFactorAuthAlreadyEnabledException = new BadRequestException(
  ErrorMessages.TWO_FACTOR_AUTH_ALREADY_ENABLED
)

export const RequiredGoogleStateError = new Error(ErrorMessages.REQUIRED_GOOGLE_STATE)

export const MissingEmailFromGoogleError = new Error(ErrorMessages.MISSING_EMAIL_FROM_GOOGLE)
