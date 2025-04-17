import { createZodDto } from 'nestjs-zod'

import { generateResSchema } from 'src/shared/utils'
import { GetUserProfileDataResSchema, GetUserProfileQuerySchema } from 'src/shared/models/user.model'

export class GetUserProfileResDto extends createZodDto(generateResSchema(GetUserProfileDataResSchema)) {}

export class GetUserProfileQueryDto extends createZodDto(GetUserProfileQuerySchema) {}

export class UpdateUserProfileResDto extends createZodDto(generateResSchema(GetUserProfileDataResSchema)) {}
