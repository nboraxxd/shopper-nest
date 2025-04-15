import { SetMetadata } from '@nestjs/common'

import { AuthType, AuthTypeUnion, ConditionGuard } from 'src/shared/constants/auth.constant'

export const AUTH_TYPE_KEY = 'authType'

export type AuthTypeDecoratorPayload = {
  authTypes: AuthTypeUnion[]
  options: { condition: ConditionGuard }
}

export const Auth = (
  authTypes: (typeof AuthType)[keyof typeof AuthType][],
  options?: { condition: ConditionGuard }
) => {
  return SetMetadata(AUTH_TYPE_KEY, { authTypes, options: options ?? { condition: ConditionGuard.AND } })
}

export const IsPublic = () => Auth([AuthType.NONE])
