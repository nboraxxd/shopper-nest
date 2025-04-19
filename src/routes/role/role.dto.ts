import { createZodDto } from 'nestjs-zod'

import { generatePagedResSchema, generateResSchema } from 'src/shared/utils'

import {
  CreateRoleBodySchema,
  GetRoleDataResSchema,
  GetRolesDataResSchema,
  GetRolesQuerySchema,
  RoleParamSchema,
  UpdateRoleBodySchema,
} from 'src/routes/role/role.model'

export class RoleParamDto extends createZodDto(RoleParamSchema) {}
export class GetRolesQueryDto extends createZodDto(GetRolesQuerySchema) {}

export class CreateRoleBodyDto extends createZodDto(CreateRoleBodySchema) {}
export class UpdateRoleBodyDto extends createZodDto(UpdateRoleBodySchema) {}

export class GetRoleResDto extends createZodDto(generateResSchema(GetRoleDataResSchema)) {}
export class GetRolesResDto extends createZodDto(generatePagedResSchema(GetRolesDataResSchema)) {}
