import { z } from 'zod'

import { HTTPMethod } from 'src/shared/constants/role.constant'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'

import { ErrorMessages } from 'src/routes/permission/permission.constant'

const nameSchema = z
  .string({
    required_error: ErrorMessages.PERMISSION_NAME_REQUIRED,
    invalid_type_error: ErrorMessages.PERMISSION_NAME_INVALID,
  })
  .max(500, ErrorMessages.PERMISSION_NAME_TOO_LONG)

const methodSchema = z.enum(
  [
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ],
  { message: ErrorMessages.PERMISSION_METHOD_INVALID }
)

export const PermissionModelSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string(),
  path: z.string().max(1000),
  method: methodSchema,
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
})

export const CreatePermissionBodySchema = z
  .object({
    name: nameSchema,
    description: z
      .string({
        invalid_type_error: ErrorMessages.PERMISSION_DESCRIPTION_INVALID,
      })
      .optional(),
    path: z
      .string({
        required_error: ErrorMessages.PERMISSION_PATH_REQUIRED,
        invalid_type_error: ErrorMessages.PERMISSION_PATH_INVALID,
      })
      .max(1000, ErrorMessages.PERMISSION_PATH_TOO_LONG),
    method: methodSchema,
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })

export const PermissionParamSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })

export const GetPermissionDataResSchema = PermissionModelSchema.omit({
  deletedById: true,
  deletedAt: true,
})

export const GetPermissionsQuerySchema = z
  .object({
    page: z.coerce
      .number({
        required_error: CommonErrorMessages.PAGE_REQUIRED,
        invalid_type_error: CommonErrorMessages.PAGE_INVALID,
      })
      .int(CommonErrorMessages.PAGE_INVALID)
      .positive(CommonErrorMessages.PAGE_INVALID)
      .default(1),
    limit: z.coerce
      .number({
        required_error: CommonErrorMessages.LIMIT_REQUIRED,
        invalid_type_error: CommonErrorMessages.LIMIT_INVALID,
      })
      .int(CommonErrorMessages.LIMIT_INVALID)
      .positive(CommonErrorMessages.LIMIT_INVALID)
      .default(10),
  })
  .strict({
    message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED,
  })

export const GetPermissionsDataResSchema = z.array(GetPermissionDataResSchema)

export const UpdatePermissionBodySchema = CreatePermissionBodySchema.partial().strict(
  CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED
)

// types
export type PermissionModel = z.infer<typeof PermissionModelSchema>

export type CreatePermissionBody = z.infer<typeof CreatePermissionBodySchema>

export type PermissionParam = z.infer<typeof PermissionParamSchema>

export type GetPermissionDataRes = z.infer<typeof GetPermissionDataResSchema>

export type GetPermissionsQuery = z.infer<typeof GetPermissionsQuerySchema>

export type GetPermissionsDataRes = z.infer<typeof GetPermissionsDataResSchema>

export type UpdatePermissionBody = z.infer<typeof UpdatePermissionBodySchema>
