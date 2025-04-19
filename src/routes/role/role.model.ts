import { z } from 'zod'

import { RoleModelSchema } from 'src/shared/models/role.model'
import { limitSchema, pageSchema } from 'src/shared/models/common.model'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'
import { PermissionModelSchema } from 'src/shared/models/permission.model'

import { ErrorMessages } from 'src/routes/role/role.constant'

export const CreateRoleBodySchema = z
  .object({
    name: z
      .string({
        required_error: ErrorMessages.ROLE_NAME_REQUIRED,
        invalid_type_error: ErrorMessages.ROLE_NAME_INVALID,
      })
      .max(500, ErrorMessages.ROLE_NAME_TOO_LONG),
    description: z
      .string({
        invalid_type_error: ErrorMessages.ROLE_DESCRIPTION_INVALID,
      })
      .optional(),
    isActive: z
      .boolean({
        invalid_type_error: ErrorMessages.ROLE_IS_ACTIVE_INVALID,
      })
      .optional(),
  })
  .strict(CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED)

export const UpdateRoleBodySchema = CreateRoleBodySchema.extend({
  permissionIds: z
    .array(
      z
        .number({
          invalid_type_error: CommonErrorMessages.PERMISSION_ID_INVALID,
        })
        .int(CommonErrorMessages.PERMISSION_ID_INVALID)
        .positive(CommonErrorMessages.PERMISSION_ID_INVALID)
    )
    .optional()
    .refine((val) => (val ? new Set(val).size === val.length : true), {
      message: CommonErrorMessages.PERMISSION_ID_MUST_BE_UNIQUE,
    }),
}).partial()

export const RoleParamSchema = z
  .object({
    id: z.coerce
      .number({
        required_error: ErrorMessages.ROLE_ID_REQUIRED,
        invalid_type_error: ErrorMessages.ROLE_ID_INVALID,
      })
      .int(ErrorMessages.ROLE_ID_INVALID)
      .positive(ErrorMessages.ROLE_ID_INVALID),
  })
  .strict(CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED)

export const GetRolesQuerySchema = z
  .object({
    page: pageSchema,
    limit: limitSchema,
    isActive: z
      .enum(['true', 'false'], { message: ErrorMessages.ROLE_IS_ACTIVE_INVALID })
      .optional()
      .transform((val) => {
        if (val === undefined) return undefined
        return val === 'true' ? true : false
      }),
  })
  .strict({
    message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED,
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

export const GetRolesDataResSchema = z.array(GetRoleDataResSchema.omit({ permissions: true }))

export type RoleParam = z.infer<typeof RoleParamSchema>
export type GetRolesQuery = z.infer<typeof GetRolesQuerySchema>

export type CreateRoleBody = z.infer<typeof CreateRoleBodySchema>
export type UpdateRoleBody = z.infer<typeof UpdateRoleBodySchema>

export type GetRolesDataRes = z.infer<typeof GetRolesDataResSchema>
export type GetRoleDataRes = z.infer<typeof GetRoleDataResSchema>
