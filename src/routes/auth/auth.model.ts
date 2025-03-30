import { z } from 'zod'

import { UserModelSchema } from 'src/shared/models/shared-user.model'
import { codeSchema, emailSchema } from 'src/shared/models/common.model'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'

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

// schemas
export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: emailSchema,
  code: codeSchema,
  type: z.enum([TypeOfVerificationCode.REGISTER, TypeOfVerificationCode.FORGOT_PASSWORD]),
  expiresAt: z.date(),
  createdAt: z.date(),
})

export const RegisterBodySchema = UserModelSchema.pick({
  name: true,
  email: true,
  phoneNumber: true,
  password: true,
})
  .extend({
    confirmPassword: z
      .string({ required_error: 'confirmPassword is required' })
      .min(6, { message: 'confirmPassword must be at least 6 characters' }),
    code: codeSchema,
  })
  .strict({ message: 'Additional properties not allowed' })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

export const RegisterDataResSchema = UserModelSchema.omit({
  password: true,
  totpSecret: true,
  createdById: true,
  updatedById: true,
  deletedAt: true,
})

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict()

export const LoginBodySchema = UserModelSchema.pick({
  email: true,
  password: true,
}).strict({ message: 'Additional properties not allowed' })

export const LoginDataResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

// types
export type RefreshTokenModel = z.infer<typeof RefreshTokenModelSchema>
export type RoleModel = z.infer<typeof RoleModelSchema>
export type DeviceModel = z.infer<typeof DeviceModelSchema>

export type VerificationCode = z.infer<typeof VerificationCodeSchema>
export type RegisterBody = z.infer<typeof RegisterBodySchema>
export type RegisterDataRes = z.infer<typeof RegisterDataResSchema>
export type SendOTPBody = z.infer<typeof SendOTPBodySchema>
export type LoginBody = z.infer<typeof LoginBodySchema>
export type LoginDataRes = z.infer<typeof LoginDataResSchema>
