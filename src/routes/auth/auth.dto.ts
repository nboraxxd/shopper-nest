import { createZodDto } from 'nestjs-zod'

import { generateSuccessResSchema } from 'src/shared/helper'
import { UserModelSchema } from 'src/shared/models/shared-user.model'

import {
  LoginBodySchema,
  LoginDataResSchema,
  RegisterBodySchema,
  RegisterDataResSchema,
  SendOTPBodySchema,
} from 'src/routes/auth/auth.model'

export class UserDto extends createZodDto(UserModelSchema) {}

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export class RegisterResDto extends createZodDto(generateSuccessResSchema(RegisterDataResSchema)) {}

export class SendOTPBodyDto extends createZodDto(SendOTPBodySchema) {}

export class LoginBodyDto extends createZodDto(LoginBodySchema) {}

export class LoginResDto extends createZodDto(generateSuccessResSchema(LoginDataResSchema)) {}
