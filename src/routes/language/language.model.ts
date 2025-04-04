import { z } from 'zod'

import { CommonErrorMessages } from 'src/shared/constants/common.constant'

import { ErrorMessages } from 'src/routes/language/language.constant'

// models
export const LanguageModelSchema = z.object({
  id: z.string().max(10),
  name: z.string().max(500),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// schemas
const idSchema = z
  .string({
    required_error: ErrorMessages.LANGUAGE_ID_REQUIRED,
    invalid_type_error: ErrorMessages.LANGUAGE_ID_INVALID,
  })
  .max(10, ErrorMessages.LANGUAGE_ID_TOO_LONG)

const nameSchema = z
  .string({
    required_error: ErrorMessages.LANGUAGE_NAME_REQUIRED,
    invalid_type_error: ErrorMessages.LANGUAGE_NAME_INVALID,
  })
  .max(500, ErrorMessages.LANGUAGE_NAME_TOO_LONG)

export const CreateLanguageBodySchema = z
  .object({ id: idSchema, name: nameSchema })
  .strict(CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED)

export const LanguageParamSchema = z
  .object({ id: idSchema })
  .strict(CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED)

export const GetLanguageDataResSchema = LanguageModelSchema.pick({
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
})

export const GetLanguagesDataResSchema = z.array(GetLanguageDataResSchema)

export const UpdateLanguageBodySchema = CreateLanguageBodySchema.pick({ name: true }).strict(
  CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED
)

// types
export type LanguageModel = z.infer<typeof LanguageModelSchema>

export type LanguageParam = z.infer<typeof LanguageParamSchema>
export type CreateLanguageBody = z.infer<typeof CreateLanguageBodySchema>
export type UpdateLanguageBody = z.infer<typeof UpdateLanguageBodySchema>

export type GetLanguageDataRes = z.infer<typeof GetLanguageDataResSchema>
export type GetLanguagesDataRes = z.infer<typeof GetLanguagesDataResSchema>
