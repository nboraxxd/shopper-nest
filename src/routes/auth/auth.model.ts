import { z } from 'zod'

import { UserSchema } from 'src/shared/models/shared-user.model'
import { codeSchema, emailSchema } from 'src/shared/models/common.model'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: emailSchema,
  code: codeSchema,
  type: z.enum([TypeOfVerificationCode.REGISTER, TypeOfVerificationCode.FORGOT_PASSWORD]),
  expiresAt: z.date(),
  createdAt: z.date(),
})

export type VerificationCode = z.infer<typeof VerificationCodeSchema>

export const RegisterBodySchema = UserSchema.pick({
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

export type RegisterBody = z.infer<typeof RegisterBodySchema>

export const RegisterDataResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
  createdById: true,
  updatedById: true,
  deletedAt: true,
})

export type RegisterDataRes = z.infer<typeof RegisterDataResSchema>

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict()

export type SendOTPBody = z.infer<typeof SendOTPBodySchema>
