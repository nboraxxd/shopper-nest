import { z } from 'zod'

import { HTTPMethod } from 'src/shared/constants/role.constant'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'

// schemas
export const permissionIdSchema = z.coerce
  .number({
    required_error: CommonErrorMessages.PERMISSION_ID_REQUIRED,
    invalid_type_error: CommonErrorMessages.PERMISSION_ID_INVALID,
  })
  .int(CommonErrorMessages.PERMISSION_ID_INVALID)
  .positive(CommonErrorMessages.PERMISSION_ID_INVALID)

export const permissionMethodSchema = z.enum(
  [
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ],
  { message: CommonErrorMessages.PERMISSION_METHOD_INVALID }
)

// models
export const PermissionModelSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string(),
  path: z.string().max(1000),
  method: permissionMethodSchema,
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
})

// types
export type PermissionModel = z.infer<typeof PermissionModelSchema>
