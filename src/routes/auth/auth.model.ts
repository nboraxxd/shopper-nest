import { z } from 'zod'

import {
  codeSchema,
  confirmPasswordSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
  phoneNumberSchema,
} from 'src/shared/models/common.model'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'
import { TYPE_OF_VERIFICATION_CODES } from 'src/shared/constants/shared-auth.constant'

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
  type: z.enum(TYPE_OF_VERIFICATION_CODES),
  expiresAt: z.date(),
  createdAt: z.date(),
})

// schemas
const codeTypeSchema = z.enum(TYPE_OF_VERIFICATION_CODES, { message: ErrorMessages.INVALID_VERIFICATION_CODE_TYPE })

const totpCodeSchema = z
  .string({
    required_error: ErrorMessages.REQUIRED_TOTP_CODE,
    invalid_type_error: ErrorMessages.INVALID_TOTP_CODE,
  })
  .length(6, {
    message: ErrorMessages.INVALID_TOTP_CODE_LENGTH,
  })

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
    type: codeTypeSchema,
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

export const VerifyTOTPBodySchema = z
  .object({
    email: emailSchema,
    totpCode: totpCodeSchema,
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })

export const VerifyOTPBodySchema = z
  .object({
    email: emailSchema,
    code: codeSchema,
    type: codeTypeSchema,
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })

// export const Disable2FABodySchema = z
//   .object({
//     code: codeSchema.optional(),
//     totpCode: totpCodeSchema.optional(),
//   })
//   .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })
//   .superRefine(({ code, totpCode }, ctx) => {
//     // if ((totpCode && code) || (!totpCode && !code)) {
//     if ((totpCode !== undefined) === (code !== undefined)) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: ErrorMessages.REQUIRED_ONE_OF_CODE_OR_TOTP,
//         path: ['totpCode'],
//       })
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: ErrorMessages.REQUIRED_ONE_OF_CODE_OR_TOTP,
//         path: ['code'],
//       })
//     }
//   })

export const Disable2FABodySchema = z.union(
  [
    z
      .object({
        code: codeSchema,
        totpCode: z.undefined(), // Đảm bảo totpCode không được cung cấp
      })
      .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED }),
    z
      .object({
        code: z.undefined(), // Đảm bảo code không được cung cấp
        totpCode: totpCodeSchema,
      })
      .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED }),
  ],
  {
    message: ErrorMessages.REQUIRED_ONE_OF_CODE_OR_TOTP,
  }
)

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
export type VerifyTOTPBody = z.infer<typeof VerifyTOTPBodySchema>
export type VerifyOTPBody = z.infer<typeof VerifyOTPBodySchema>
export type Disable2FABody = z.infer<typeof Disable2FABodySchema>

export type GoogleCallbackQuery = z.infer<typeof GoogleCallbackQuerySchema>

export type RegisterDataRes = z.infer<typeof RegisterDataResSchema>
export type LoginDataRes = z.infer<typeof LoginDataResSchema>
export type RefreshTokenDataRes = z.infer<typeof RefreshTokenDataResSchema>
export type GoogleLinkDataRes = z.infer<typeof GoogleLinkDataResSchema>
