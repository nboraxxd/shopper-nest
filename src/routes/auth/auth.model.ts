import { z } from 'zod'

import { UserModelSchema } from 'src/shared/models/shared-user.model'
import { codeSchema, emailSchema } from 'src/shared/models/common.model'
import { TypeOfVerificationCode } from 'src/shared/constants/shared-auth.constant'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'
import { ErrorMessages } from 'src/routes/auth/auth.constant'

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
export const RegisterBodySchema = UserModelSchema.pick({
  name: true,
  email: true,
  phoneNumber: true,
  password: true,
})
  .extend({
    confirmPassword: z
      .string({
        required_error: CommonErrorMessages.REQUIRED_CONFIRM_PASSWORD,
        invalid_type_error: CommonErrorMessages.INVALID_CONFIRM_PASSWORD,
      })
      .min(6, { message: CommonErrorMessages.SHORT_CONFIRM_PASSWORD })
      .max(100, { message: CommonErrorMessages.LONG_CONFIRM_PASSWORD }),
    code: codeSchema,
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: CommonErrorMessages.PASSWORDS_DO_NOT_MATCH,
        path: ['confirmPassword'],
      })
    }
  })

export const RegisterDataResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const SendOTPBodySchema = VerificationCodeModelSchema.pick({
  email: true,
  type: true,
}).strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })

export const LoginBodySchema = UserModelSchema.pick({
  email: true,
  password: true,
}).strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })

export const LoginDataResSchema = RegisterDataResSchema

export const DevicePayloadSchema = DeviceModelSchema.pick({
  userAgent: true,
  ip: true,
})

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
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

export type GoogleCallbackQuery = z.infer<typeof GoogleCallbackQuerySchema>

export type RegisterDataRes = z.infer<typeof RegisterDataResSchema>
export type LoginDataRes = z.infer<typeof LoginDataResSchema>
export type RefreshTokenDataRes = z.infer<typeof RefreshTokenDataResSchema>
export type GoogleLinkDataRes = z.infer<typeof GoogleLinkDataResSchema>
