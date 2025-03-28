export const REQUEST_USER_KEY = 'user'

export const AuthType = {
  Bearer: 'Bearer',
  None: 'none',
  ApiKey: 'apiKey',
} as const

export type AuthType = (typeof AuthType)[keyof typeof AuthType]

export const ConditionGuard = {
  And: 'and',
  Or: 'or',
} as const

export type ConditionGuard = (typeof ConditionGuard)[keyof typeof ConditionGuard]
