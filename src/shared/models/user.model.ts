import { z } from 'zod'

import { UserStatus } from 'src/shared/constants/user.constant'
import { RoleModelSchema } from 'src/shared/models/role.model'
import { PermissionModelSchema } from 'src/shared/models/permission.model'

const VALID_INCLUDES = ['role', 'permissions'] as const

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
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

/**
 * Áp dụng cho req, res của api GET('profile') và GET('users/:userId')
 */
const permissionsSchema = z
  .array(
    PermissionModelSchema.pick({
      id: true,
      module: true,
      path: true,
      method: true,
    })
  )
  .optional()

// query sẽ có dạng ?include=role,permissions hoặc ?include=permissions hoặc ?include=role hoặc không có gì
export const GetUserProfileQuerySchema = z.object({
  include: z
    .preprocess(
      (val) => {
        const items = typeof val === 'string' ? val.split(',') : []

        return items.filter((item) => VALID_INCLUDES.includes(item as (typeof VALID_INCLUDES)[number]))
      },
      z.array(z.enum(VALID_INCLUDES))
    )
    .optional(),
})

const PublicUserProfileSchema = UserModelSchema.pick({
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  avatar: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  twoFactorEnabled: z.boolean(),
})

export const GetUserProfileDataResSchema = PublicUserProfileSchema.extend({
  role: RoleModelSchema.pick({
    id: true,
    name: true,
  })
    .extend({
      permissions: permissionsSchema,
    })
    .optional(),
  permissions: permissionsSchema,
})

/**
 * Áp dụng cho Response của api PATCH('profile') và PATCH('users/:userId')
 */
export const UpdateUserProfileDataResSchema = PublicUserProfileSchema

// types
export type UserModel = z.infer<typeof UserModelSchema>

export type UserIdentifier =
  | Pick<UserModel, 'id' | 'deletedAt'>
  | Pick<UserModel, 'email' | 'deletedAt'>
  | Pick<UserModel, 'id' | 'deletedAt' | 'status'>
  | Pick<UserModel, 'email' | 'deletedAt' | 'status'>

export type GetUserProfileQuery = z.infer<typeof GetUserProfileQuerySchema>
export type GetUserProfileDataRes = z.infer<typeof GetUserProfileDataResSchema>
export type UpdateUserProfileDataRes = z.infer<typeof UpdateUserProfileDataResSchema>
