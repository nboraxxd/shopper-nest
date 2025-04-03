import { z } from 'zod'

import { UserStatus } from 'src/shared/constants/user.constant'

export const UserModelSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  phoneNumber: z.string().nullable(),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED]),
  roleId: z.number().positive(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type UserModel = z.infer<typeof UserModelSchema>

export type UserIdentifier = Pick<UserModel, 'id'> | Pick<UserModel, 'email'>
