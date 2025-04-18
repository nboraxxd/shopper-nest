export const SuccessMessages = {
  GET_ROLES_SUCCESSFUL: 'Success.GET_ROLES_SUCCESSFUL',
  GET_ROLE_SUCCESSFUL: 'Success.GET_ROLE_SUCCESSFUL',
  CREATE_ROLE_SUCCESSFUL: 'Success.CREATE_ROLE_SUCCESSFUL',
  UPDATE_ROLE_SUCCESSFUL: 'Success.UPDATE_ROLE_SUCCESSFUL',
  DELETE_ROLE_SUCCESSFUL: 'Success.DELETE_ROLE_SUCCESSFUL',
} as const

export const ErrorMessages = {
  ROLE_ALREADY_EXISTS: 'Error.ROLE_ALREADY_EXISTS',

  ROLE_ID_REQUIRED: 'Error.ROLE_ID_REQUIRED',
  ROLE_ID_INVALID: 'Error.ROLE_ID_INVALID',

  ROLE_NAME_REQUIRED: 'Error.ROLE_NAME_REQUIRED',
  ROLE_NAME_INVALID: 'Error.ROLE_NAME_INVALID',
  ROLE_NAME_TOO_LONG: 'Error.ROLE_NAME_TOO_LONG',

  ROLE_DESCRIPTION_INVALID: 'Error.ROLE_DESCRIPTION_INVALID',

  ROLE_IS_ACTIVE_INVALID: 'Error.ROLE_IS_ACTIVE_INVALID',

  PROHIBITED_BASE_ROLE_ACTION: 'Error.PROHIBITED_BASE_ROLE_ACTION',
} as const
