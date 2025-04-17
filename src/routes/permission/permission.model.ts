import { z } from 'zod'

import { limitSchema, pageSchema } from 'src/shared/models/common.model'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'
import { permissionIdSchema, permissionMethodSchema, PermissionModelSchema } from 'src/shared/models/permission.model'

import { ErrorMessages } from 'src/routes/permission/permission.constant'

// schemas
const nameSchema = z
  .string({
    required_error: ErrorMessages.PERMISSION_NAME_REQUIRED,
    invalid_type_error: ErrorMessages.PERMISSION_NAME_INVALID,
  })
  .max(500, ErrorMessages.PERMISSION_NAME_TOO_LONG)

export const CreatePermissionBodySchema = z
  .object({
    name: nameSchema,
    description: z
      .string({
        invalid_type_error: ErrorMessages.PERMISSION_DESCRIPTION_INVALID,
      })
      .default(''),
    path: z
      .string({
        required_error: ErrorMessages.PERMISSION_PATH_REQUIRED,
        invalid_type_error: ErrorMessages.PERMISSION_PATH_INVALID,
      })
      .max(1000, ErrorMessages.PERMISSION_PATH_TOO_LONG),
    method: permissionMethodSchema,
    module: z
      .string({
        invalid_type_error: ErrorMessages.PERMISSION_MODULE_INVALID,
      })
      .max(500, ErrorMessages.PERMISSION_MODULE_TOO_LONG)
      .default(''),
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })

export const PermissionParamSchema = z
  .object({
    id: permissionIdSchema,
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })

export const GetPermissionDataResSchema = PermissionModelSchema.omit({
  description: true,
  deletedById: true,
  deletedAt: true,
  createdById: true,
  createdAt: true,
  updatedById: true,
  updatedAt: true,
})

export const GetPermissionsQuerySchema = z
  .object({
    page: pageSchema,
    limit: limitSchema,
  })
  .strict({
    message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED,
  })

export const GetPermissionsDataResSchema = z.array(GetPermissionDataResSchema)

export const UpdatePermissionBodySchema = CreatePermissionBodySchema.partial().strict(
  CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED
)

// types
export type CreatePermissionBody = z.infer<typeof CreatePermissionBodySchema>

export type PermissionParam = z.infer<typeof PermissionParamSchema>

export type GetPermissionDataRes = z.infer<typeof GetPermissionDataResSchema>

export type GetPermissionsQuery = z.infer<typeof GetPermissionsQuerySchema>

export type GetPermissionsDataRes = z.infer<typeof GetPermissionsDataResSchema>

export type UpdatePermissionBody = z.infer<typeof UpdatePermissionBodySchema>
