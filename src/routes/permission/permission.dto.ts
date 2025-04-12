import { createZodDto } from 'nestjs-zod'

import { generatePagedResSchema, generateResSchema } from 'src/shared/utils'

import {
  CreatePermissionBodySchema,
  GetPermissionDataResSchema,
  PermissionParamSchema,
  GetPermissionsDataResSchema,
  GetPermissionsQuerySchema,
  UpdatePermissionBodySchema,
} from 'src/routes/permission/permission.model'

export class CreatePermissionBodyDto extends createZodDto(CreatePermissionBodySchema) {}
export class PermissionParamDto extends createZodDto(PermissionParamSchema) {}
export class GetPermissionsQueryDto extends createZodDto(GetPermissionsQuerySchema) {}
export class UpdatePermissionBodyDto extends createZodDto(UpdatePermissionBodySchema) {}

export class GetPermissionResDto extends createZodDto(generateResSchema(GetPermissionDataResSchema)) {}
export class GetPermissionsResDto extends createZodDto(generatePagedResSchema(GetPermissionsDataResSchema)) {}
