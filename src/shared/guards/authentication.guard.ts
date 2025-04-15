import { Reflector } from '@nestjs/core'
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException } from '@nestjs/common'

import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant'
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from 'src/shared/decorators/auth.decorator'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<AuthType, CanActivate>

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: APIKeyGuard
  ) {
    this.authTypeGuardMap = {
      [AuthType.BEARER]: this.accessTokenGuard,
      [AuthType.API_KEY]: this.apiKeyGuard,
      [AuthType.NONE]: { canActivate: () => true },
    }
  }

  private extractAuthTypePayload(context: ExecutionContext): AuthTypeDecoratorPayload {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? {
      authTypes: [AuthType.BEARER],
      options: { condition: ConditionGuard.AND },
    }

    return authTypeValue
  }

  private async handleOrCondition(guards: CanActivate[], context: ExecutionContext): Promise<boolean> {
    let lastError: any = null

    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate(context)

        if (canActivate) return true
      } catch (error) {
        lastError = error
      }
    }

    if (lastError instanceof HttpException) {
      throw lastError
    }
    throw new UnauthorizedException(lastError?.message || CommonErrorMessages.UNAUTHORIZED)
  }

  private async handleAndCondition(guards: CanActivate[], context: ExecutionContext): Promise<boolean> {
    // Iterate through all guards, ensuring each guard passes; if any guard fails, throw an UnauthorizedException
    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate(context)

        if (!canActivate) {
          throw new UnauthorizedException(CommonErrorMessages.UNAUTHORIZED)
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error
        }
        throw new UnauthorizedException(error?.message || CommonErrorMessages.UNAUTHORIZED)
      }
    }

    // If all guards pass, return true
    return true
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.extractAuthTypePayload(context)

    const guards = authTypeValue.authTypes.map((authType) => this.authTypeGuardMap[authType])

    return authTypeValue.options.condition === ConditionGuard.AND
      ? this.handleAndCondition(guards, context)
      : this.handleOrCondition(guards, context)
  }
}
