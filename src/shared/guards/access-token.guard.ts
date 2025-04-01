import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'

import { TokenService } from 'src/shared/services/token.service'
import { REQUEST_USER_KEY } from 'src/shared/constants/shared-auth.constant'
import { isJsonWebTokenError } from 'src/shared/helper'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const accessToken = request.headers.authorization?.split(' ')[1]

    if (!accessToken) {
      throw new UnauthorizedException('Access token is required')
    }

    try {
      const decodedToken = await this.tokenService.verifyAccessToken(accessToken)
      request[REQUEST_USER_KEY] = decodedToken
      return true
    } catch (error) {
      if (isJsonWebTokenError(error)) {
        throw new UnauthorizedException(error.message)
      } else {
        throw new UnauthorizedException('Invalid access token')
      }
    }
  }
}
