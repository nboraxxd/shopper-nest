import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'

export const JsonWebTokenException = (errorMessage: string) => new UnauthorizedException(errorMessage)

export const UserNotFoundException = new BadRequestException(CommonErrorMessages.USER_NOT_FOUND)

export const UserBlockedException = new BadRequestException(CommonErrorMessages.USER_BLOCKED)
