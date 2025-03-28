import { z } from 'zod'

import { UserStatus } from 'src/routes/auth/auth.constant'
import { emailSchema, nameSchema, passwordSchema, phoneNumberSchema } from 'src/shared/shared.dto'

export const UserSchema = z.object({
  id: z.number(),
  name: nameSchema,
  email: emailSchema,
  phoneNumber: phoneNumberSchema,
  password: passwordSchema,
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number().positive(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type User = z.infer<typeof UserSchema>

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

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
  createdById: true,
  updatedById: true,
  deletedAt: true,
})

export type RegisterRes = z.infer<typeof RegisterResSchema>
