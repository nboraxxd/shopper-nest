import { z } from 'zod'

import { CommonErrorMessages } from 'src/shared/constants/common.constant'
import { TypeOfVerificationCode } from 'src/shared/constants/shared-auth.constant'
import {
  codeSchema,
  confirmPasswordSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
  phoneNumberSchema,
} from 'src/shared/models/common.model'

import { ErrorMessages } from 'src/routes/auth/auth.constant'

export const validatePasswordMatch = (password: string, confirmPassword: string, ctx: z.RefinementCtx) => {
  if (password !== confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: CommonErrorMessages.PASSWORDS_DO_NOT_MATCH,
      path: ['confirmPassword'],
    })
  }
}

// models
export const RefreshTokenModelSchema = z.object({
  token: z.string(),
  userId: z.number(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date(),
})

export const RoleModelSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const DeviceModelSchema = z.object({
  id: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  userId: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  lastActive: z.date(),
})

export const VerificationCodeModelSchema = z.object({
  id: z.number(),
  email: emailSchema,
  code: codeSchema,
  type: z.enum([TypeOfVerificationCode.REGISTER, TypeOfVerificationCode.FORGOT_PASSWORD]),
  expiresAt: z.date(),
  createdAt: z.date(),
})

// schemas
export const RegisterBodySchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phoneNumber: phoneNumberSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    code: codeSchema,
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })
  .superRefine((data, ctx) => {
    validatePasswordMatch(data.password, data.confirmPassword, ctx)
  })

export const RegisterDataResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const SendOTPBodySchema = z
  .object({
    email: emailSchema,
    type: z.enum([TypeOfVerificationCode.REGISTER, TypeOfVerificationCode.FORGOT_PASSWORD], {
      message: ErrorMessages.INVALID_VERIFICATION_CODE_TYPE,
    }),
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })

export const LoginBodySchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })

export const LoginDataResSchema = RegisterDataResSchema

export const DevicePayloadSchema = z.object({
  userAgent: z.string(),
  ip: z.string(),
})

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string({
      required_error: ErrorMessages.REQUIRED_REFRESH_TOKEN,
      invalid_type_error: ErrorMessages.INVALID_REFRESH_TOKEN,
    }),
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })

export const RefreshTokenDataResSchema = RegisterDataResSchema

export const LogoutBodySchema = RefreshTokenBodySchema

export const GoogleLinkDataResSchema = z.object({
  url: z.string(),
})

export const GoogleCallbackQuerySchema = z.object({
  code: z.string({
    required_error: ErrorMessages.REQUIRED_GOOGLE_CODE,
    invalid_type_error: ErrorMessages.INVALID_GOOGLE_CODE,
  }),
  state: z.string({ invalid_type_error: ErrorMessages.INVALID_GOOGLE_STATE }).optional(),
})

export const ForgotPasswordBodySchema = z
  .object({
    email: emailSchema,
    code: codeSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })
  .superRefine((data, ctx) => {
    validatePasswordMatch(data.password, data.confirmPassword, ctx)
  })

// types
export type RefreshTokenModel = z.infer<typeof RefreshTokenModelSchema>
export type RoleModel = z.infer<typeof RoleModelSchema>
export type DeviceModel = z.infer<typeof DeviceModelSchema>
export type VerificationCodeModel = z.infer<typeof VerificationCodeModelSchema>

export type RegisterBody = z.infer<typeof RegisterBodySchema>
export type SendOTPBody = z.infer<typeof SendOTPBodySchema>
export type LoginBody = z.infer<typeof LoginBodySchema>
export type DevicePayload = z.infer<typeof DevicePayloadSchema>
export type RefreshTokenBody = z.infer<typeof RefreshTokenBodySchema>
export type LogoutBody = z.infer<typeof LogoutBodySchema>
export type ForgotPasswordBody = z.infer<typeof ForgotPasswordBodySchema>

export type GoogleCallbackQuery = z.infer<typeof GoogleCallbackQuerySchema>

export type RegisterDataRes = z.infer<typeof RegisterDataResSchema>
export type LoginDataRes = z.infer<typeof LoginDataResSchema>
export type RefreshTokenDataRes = z.infer<typeof RefreshTokenDataResSchema>
export type GoogleLinkDataRes = z.infer<typeof GoogleLinkDataResSchema>
