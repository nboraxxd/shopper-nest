import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'

export const JsonWebTokenException = (errorMessage: string) => new UnauthorizedException(errorMessage)

export const RequiredAccessTokenException = new UnauthorizedException(CommonErrorMessages.REQUIRED_ACCESS_TOKEN)

export const InvalidAccessTokenException = new UnauthorizedException(CommonErrorMessages.INVALID_ACCESS_TOKEN)

export const DataNotFoundException = (message?: string) =>
  new NotFoundException(message || CommonErrorMessages.DATA_NOT_FOUND)

export const UserNotFoundException = new NotFoundException(CommonErrorMessages.USER_NOT_FOUND)

export const UserBlockedException = new BadRequestException(CommonErrorMessages.USER_BLOCKED)
