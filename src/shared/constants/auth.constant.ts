export const AuthType = {
  BEARER: 'Bearer',
  NONE: 'none',
  API_KEY: 'apiKey',
} as const

export type AuthTypeUnion = (typeof AuthType)[keyof typeof AuthType]

export const ConditionGuard = {
  AND: 'and',
  OR: 'or',
} as const

export type ConditionGuard = (typeof ConditionGuard)[keyof typeof ConditionGuard]
