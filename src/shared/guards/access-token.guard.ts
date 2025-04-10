import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

import {
  InvalidAccessTokenException,
  JsonWebTokenException,
  RequiredAccessTokenException,
} from 'src/shared/models/error.model'
import { isJsonWebTokenError } from 'src/shared/utils/errors'
import { ACCESS_TOKEN_PAYLOAD } from 'src/shared/constants/common.constant'
import { TokenService } from 'src/shared/services/token.service'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const accessToken = request.headers.authorization?.split(' ')[1]

    if (!accessToken) {
      throw RequiredAccessTokenException
    }

    try {
      const accessTokenPayload = await this.tokenService.verifyAccessToken(accessToken)
      request[ACCESS_TOKEN_PAYLOAD] = accessTokenPayload
      return true
    } catch (error) {
      if (isJsonWebTokenError(error)) {
        throw JsonWebTokenException(error.message)
      } else {
        throw InvalidAccessTokenException
      }
    }
  }
}
