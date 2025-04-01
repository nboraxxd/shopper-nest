import { UnauthorizedException } from '@nestjs/common'

export const JsonWebTokenException = (errorMessage: string) => new UnauthorizedException(errorMessage)
