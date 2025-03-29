import { z } from 'zod'

import { UserStatus } from 'src/shared/constants/auth.constant'
import { emailSchema, nameSchema, passwordSchema, phoneNumberSchema } from 'src/shared/models/common.model'

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
