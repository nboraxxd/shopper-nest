import { z } from 'zod'

import { PermissionModelSchema } from 'src/shared/models/permission.model'

export const RoleModelSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const GetRoleDataResSchema = RoleModelSchema.pick({
  id: true,
  name: true,
  isActive: true,
}).extend({
  permissions: z.array(
    PermissionModelSchema.pick({
      id: true,
      name: true,
      method: true,
      path: true,
      module: true,
    })
  ),
})

export type RoleModel = z.infer<typeof RoleModelSchema>
export type GetRoleDataRes = z.infer<typeof GetRoleDataResSchema>
