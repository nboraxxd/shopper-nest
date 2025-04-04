import { createZodDto } from 'nestjs-zod'

import { generateListResSchema, generateResSchema } from 'src/shared/utils'

import {
  CreateLanguageBodySchema,
  GetLanguageDataResSchema,
  GetLanguagesDataResSchema,
  LanguageParamSchema,
  UpdateLanguageBodySchema,
} from 'src/routes/language/language.model'

export class LanguageParamDto extends createZodDto(LanguageParamSchema) {}
export class CreateLanguageBodyDto extends createZodDto(CreateLanguageBodySchema) {}
export class UpdateLanguageBodyDto extends createZodDto(UpdateLanguageBodySchema) {}

export class GetLanguageDetailResDto extends createZodDto(generateResSchema(GetLanguageDataResSchema)) {}
export class GetLanguagesResDto extends createZodDto(generateListResSchema(GetLanguagesDataResSchema)) {}
