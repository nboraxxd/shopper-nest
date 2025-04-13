import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'

import { CommonErrorMessages } from 'src/shared/constants/common.constant'

import { ErrorMessages } from 'src/routes/auth/auth.constant'

/**
 * Code and token errors
 */

export const DuplicateRefreshTokenException = new UnauthorizedException(ErrorMessages.DUPLICATE_REFRESH_TOKEN)

export const RefreshTokenNotFoundException = new UnauthorizedException(ErrorMessages.REFRESH_TOKEN_NOT_FOUND)

export const InvalidOTPCodeException = new UnprocessableEntityException({
  message: CommonErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.INVALID_OTP_CODE, path: 'code', location: 'body' }],
})

export const ExpiredOTPCodeException = new UnprocessableEntityException({
  message: CommonErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.EXPIRED_OTP_CODE, path: 'code', location: 'body' }],
})

export const TwoFactorAuthAlreadyEnabledException = new BadRequestException(
  ErrorMessages.TWO_FACTOR_AUTH_ALREADY_ENABLED
)

export const TwoFactorAuthNotEnabledException = new BadRequestException(ErrorMessages.TWO_FACTOR_AUTH_NOT_ENABLED)

export const NoNeededCodeOrTOTPException = new BadRequestException(ErrorMessages.NO_NEEDED_CODE_OR_TOTP)

export const InvalidTOTPCodeException = new UnprocessableEntityException({
  message: CommonErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.INVALID_TOTP_CODE, path: 'totpCode', location: 'body' }],
})

/**
 * Auth errors
 */

export const EmailAlreadyExistsException = new UnprocessableEntityException({
  message: CommonErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.EMAIL_ALREADY_EXISTS, path: 'email', location: 'body' }],
})

export const EmailDoesNotExistException = new UnprocessableEntityException({
  message: CommonErrorMessages.GENERIC,
  errors: [{ message: ErrorMessages.EMAIL_DOES_NOT_EXIST, path: 'email', location: 'body' }],
})

export const EmailOrPasswordIncorrectException = (path: string) =>
  new UnprocessableEntityException({
    message: CommonErrorMessages.GENERIC,
    errors: [{ message: ErrorMessages.EMAIL_OR_PASSWORD_INCORRECT, path, location: 'body' }],
  })

export const NotFoundClientRoleException = new NotFoundException(ErrorMessages.CLIENT_ROLE_NOT_FOUND)

export const RequiredGoogleStateError = new Error(ErrorMessages.REQUIRED_GOOGLE_STATE)

export const MissingEmailFromGoogleError = new Error(ErrorMessages.MISSING_EMAIL_FROM_GOOGLE)
