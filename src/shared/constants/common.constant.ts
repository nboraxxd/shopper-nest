import { PermissionModel } from 'src/shared/models/permission.model'

export const ACCESS_TOKEN_PAYLOAD = 'accessTokenPayload'

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

export const CommonErrorMessages = {
  GENERIC: 'Error.GENERIC',
  ADDITIONAL_PROPERTIES_NOT_ALLOWED: 'Error.ADDITIONAL_PROPERTIES_NOT_ALLOWED',
  DATA_NOT_FOUND: 'Error.DATA_NOT_FOUND',
  RECORD_NOT_FOUND: 'Error.RECORD_NOT_FOUND',
  UNAUTHORIZED: 'Error.UNAUTHORIZED',

  ACCESS_TOKEN_REQUIRED: 'Error.ACCESS_TOKEN_REQUIRED',
  ACCESS_TOKEN_INVALID: 'Error.ACCESS_TOKEN_INVALID',

  REQUIRED_NAME: 'Error.REQUIRED_NAME',
  INVALID_NAME_TYPE: 'Error.INVALID_NAME_TYPE',
  SHORT_NAME: 'Error.SHORT_NAME',
  LONG_NAME: 'Error.LONG_NAME',

  REQUIRED_EMAIL: 'Error.REQUIRED_EMAIL',
  INVALID_EMAIL_TYPE: 'Error.INVALID_EMAIL_TYPE',
  INVALID_EMAIL: 'Error.INVALID_EMAIL',

  REQUIRED_PHONE_NUMBER: 'Error.REQUIRED_PHONE_NUMBER',
  INVALID_PHONE_NUMBER: 'Error.INVALID_PHONE_NUMBER',

  REQUIRED_PASSWORD: 'Error.REQUIRED_PASSWORD',
  INVALID_PASSWORD: 'Error.INVALID_PASSWORD',
  SHORT_PASSWORD: 'Error.SHORT_PASSWORD',
  LONG_PASSWORD: 'Error.LONG_PASSWORD',

  REQUIRED_CONFIRM_PASSWORD: 'Error.REQUIRED_CONFIRM_PASSWORD',
  INVALID_CONFIRM_PASSWORD: 'Error.INVALID_CONFIRM_PASSWORD',
  SHORT_CONFIRM_PASSWORD: 'Error.SHORT_CONFIRM_PASSWORD',
  LONG_CONFIRM_PASSWORD: 'Error.LONG_CONFIRM_PASSWORD',
  PASSWORDS_DO_NOT_MATCH: 'Error.PASSWORDS_DO_NOT_MATCH',

  REQUIRED_CODE: 'Error.REQUIRED_CODE',
  INVALID_CODE: 'Error.INVALID_CODE',
  CODE_LENGTH: 'Error.CODE_LENGTH',

  USER_NOT_FOUND: 'Error.USER_NOT_FOUND',
  USER_BLOCKED: 'Error.USER_BLOCKED',

  PAGE_REQUIRED: 'Error.PAGE_REQUIRED',
  PAGE_INVALID: 'Error.PAGE_INVALID',

  LIMIT_REQUIRED: 'Error.LIMIT_REQUIRED',
  LIMIT_INVALID: 'Error.LIMIT_INVALID',

  PERMISSION_ID_REQUIRED: 'Error.PERMISSION_ID_REQUIRED',
  PERMISSION_ID_INVALID: 'Error.PERMISSION_ID_INVALID',
  PERMISSION_ID_MUST_BE_UNIQUE: 'Error.PERMISSION_ID_MUST_BE_UNIQUE',
  PERMISSION_IDS_NOT_FOUND: (ids: PermissionModel['id'][]) => `Error.PERMISSION_IDS_NOT_FOUND: ${ids.join(', ')}`,
  PERMISSION_METHOD_INVALID: 'Error.PERMISSION_METHOD_INVALID',
  INSUFFICIENT_PERMISSION: 'Error.INSUFFICIENT_PERMISSION',

  ROLE_NOT_FOUND: 'Error.ROLE_NOT_FOUND',
} as const
