import { Reflector } from '@nestjs/core'
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'

import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from 'src/shared/decorators/auth.decorator'
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant'
import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: APIKeyGuard
  ) {}

  private get authTypeGuardMap(): Record<string, CanActivate> {
    return {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.ApiKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue: AuthTypeDecoratorPayload = this.reflector.getAllAndOverride<
      AuthTypeDecoratorPayload | undefined
    >(AUTH_TYPE_KEY, [context.getHandler(), context.getClass()]) ?? {
      authTypes: [AuthType.None],
      options: { condition: ConditionGuard.And },
    }

    const guards = authTypeValue.authTypes.map((authType) => this.authTypeGuardMap[authType])

    const error = new UnauthorizedException('Unauthorized')

    if (authTypeValue.options.condition === ConditionGuard.Or) {
      for (const instance of guards) {
        try {
          const canActivate = await instance.canActivate(context)

          if (canActivate) return true
        } catch (_error) {
          error.message = _error.message
        }
      }

      throw new UnauthorizedException(error.message)
    } else {
      for (const instance of guards) {
        try {
          const canActivate = await instance.canActivate(context)

          if (!canActivate) {
            throw new UnauthorizedException('Unauthorized')
          }
        } catch (error) {
          throw new UnauthorizedException(error.message)
        }
      }

      return true
    }
  }
}
