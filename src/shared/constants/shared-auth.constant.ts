export const REQUEST_USER_KEY = 'user'

export const AuthType = {
  BEARER: 'Bearer',
  NONE: 'none',
  API_KEY: 'apiKey',
} as const

export type AuthType = (typeof AuthType)[keyof typeof AuthType]

export const ConditionGuard = {
  AND: 'and',
  OR: 'or',
} as const

export type ConditionGuard = (typeof ConditionGuard)[keyof typeof ConditionGuard]

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
} as const

export const TypeOfVerificationCode = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  LOGIN: 'LOGIN',
  DISABLE_2FA: 'DISABLE_2FA',
} as const

export const TYPE_OF_VERIFICATION_CODES = [
  TypeOfVerificationCode.REGISTER,
  TypeOfVerificationCode.FORGOT_PASSWORD,
  TypeOfVerificationCode.LOGIN,
  TypeOfVerificationCode.DISABLE_2FA,
] as const
