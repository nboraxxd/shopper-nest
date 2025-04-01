import { createZodDto } from 'nestjs-zod'

import { generateSuccessResSchema } from 'src/shared/utils'

import {
  LoginBodySchema,
  LoginDataResSchema,
  RegisterBodySchema,
  RegisterDataResSchema,
  SendOTPBodySchema,
  RefreshTokenBodySchema,
  RefreshTokenDataResSchema,
  LogoutBodySchema,
  GoogleLinkDataResSchema,
  ForgotPasswordBodySchema,
} from 'src/routes/auth/auth.model'

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class SendOTPBodyDto extends createZodDto(SendOTPBodySchema) {}
export class LoginBodyDto extends createZodDto(LoginBodySchema) {}
export class RefreshTokenBodyDto extends createZodDto(RefreshTokenBodySchema) {}
export class LogoutBodyDto extends createZodDto(LogoutBodySchema) {}
export class ForgotPasswordBodyDto extends createZodDto(ForgotPasswordBodySchema) {}

export class RegisterResDto extends createZodDto(generateSuccessResSchema(RegisterDataResSchema)) {}
export class LoginResDto extends createZodDto(generateSuccessResSchema(LoginDataResSchema)) {}
export class RefreshTokenResDto extends createZodDto(generateSuccessResSchema(RefreshTokenDataResSchema)) {}
export class GoogleLinkResDto extends createZodDto(generateSuccessResSchema(GoogleLinkDataResSchema)) {}
