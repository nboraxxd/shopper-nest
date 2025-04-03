import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'

/**
 * Common errors
 */

export const JsonWebTokenException = (errorMessage: string) => new UnauthorizedException(errorMessage)

export const RequiredAccessTokenException = new UnauthorizedException(CommonErrorMessages.REQUIRED_ACCESS_TOKEN)

export const InvalidAccessTokenException = new UnauthorizedException(CommonErrorMessages.INVALID_ACCESS_TOKEN)

export const UserNotFoundException = new BadRequestException(CommonErrorMessages.USER_NOT_FOUND)

export const UserBlockedException = new BadRequestException(CommonErrorMessages.USER_BLOCKED)
