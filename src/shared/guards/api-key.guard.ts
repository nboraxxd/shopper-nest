import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'

import envConfig from 'src/shared/env-config'

@Injectable()
export class APIKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const xApiKey = request.headers['x-api-key']

    if (!xApiKey || xApiKey !== envConfig.SECRET_API_KEY) {
      throw new UnauthorizedException('Invalid x-api-key')
    }

    return true
  }
}
