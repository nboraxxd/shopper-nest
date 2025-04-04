import { createZodDto } from 'nestjs-zod'

import { generateResSchema } from 'src/shared/utils'

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
  Setup2FADataResSchema,
  Disable2FABodySchema,
} from 'src/routes/auth/auth.model'

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class SendOTPBodyDto extends createZodDto(SendOTPBodySchema) {}
export class LoginBodyDto extends createZodDto(LoginBodySchema) {}
export class RefreshTokenBodyDto extends createZodDto(RefreshTokenBodySchema) {}
export class LogoutBodyDto extends createZodDto(LogoutBodySchema) {}
export class ForgotPasswordBodyDto extends createZodDto(ForgotPasswordBodySchema) {}
export class Disable2FABodyDto extends createZodDto(Disable2FABodySchema) {}

export class RegisterResDto extends createZodDto(generateResSchema(RegisterDataResSchema)) {}
export class LoginResDto extends createZodDto(generateResSchema(LoginDataResSchema)) {}
export class RefreshTokenResDto extends createZodDto(generateResSchema(RefreshTokenDataResSchema)) {}
export class GoogleLinkResDto extends createZodDto(generateResSchema(GoogleLinkDataResSchema)) {}
export class Setup2FAResDto extends createZodDto(generateResSchema(Setup2FADataResSchema)) {}
