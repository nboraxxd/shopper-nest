import { z } from 'zod'

import { CommonErrorMessages } from 'src/shared/constants/common.constant'

// Schemas
export const MessageResSchema = z.object({ message: z.string() })

export const EmptyBodySchema = z.object({}).strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })

export const nameSchema = z
  .string({
    required_error: CommonErrorMessages.REQUIRED_NAME,
    invalid_type_error: CommonErrorMessages.INVALID_NAME_TYPE,
  })
  .trim()
  .min(2, { message: CommonErrorMessages.SHORT_NAME })
  .max(100, { message: CommonErrorMessages.LONG_NAME })

export const emailSchema = z
  .string({
    required_error: CommonErrorMessages.REQUIRED_EMAIL,
    invalid_type_error: CommonErrorMessages.INVALID_EMAIL_TYPE,
  })
  .trim()
  .email({ message: CommonErrorMessages.INVALID_EMAIL })

export const phoneNumberSchema = z
  .string({
    required_error: CommonErrorMessages.REQUIRED_PHONE_NUMBER,
    invalid_type_error: CommonErrorMessages.INVALID_PHONE_NUMBER,
  })
  .regex(/(?:\+84|0084|0)[235789][0-9]{1,2}[0-9]{7}(?:[^\d]+|$)/, CommonErrorMessages.INVALID_PHONE_NUMBER)

export const passwordSchema = z
  .string({
    required_error: CommonErrorMessages.REQUIRED_PASSWORD,
    invalid_type_error: CommonErrorMessages.INVALID_PASSWORD,
  })
  .min(6, { message: CommonErrorMessages.SHORT_PASSWORD })
  .max(100, { message: CommonErrorMessages.LONG_PASSWORD })

export const confirmPasswordSchema = z
  .string({
    required_error: CommonErrorMessages.REQUIRED_CONFIRM_PASSWORD,
    invalid_type_error: CommonErrorMessages.INVALID_CONFIRM_PASSWORD,
  })
  .min(6, { message: CommonErrorMessages.SHORT_CONFIRM_PASSWORD })
  .max(100, { message: CommonErrorMessages.LONG_CONFIRM_PASSWORD })

export const codeSchema = z
  .string({ required_error: CommonErrorMessages.REQUIRED_CODE, invalid_type_error: CommonErrorMessages.INVALID_CODE })
  .length(6, { message: CommonErrorMessages.CODE_LENGTH })

export const pageSchema = z.coerce
  .number({
    required_error: CommonErrorMessages.PAGE_REQUIRED,
    invalid_type_error: CommonErrorMessages.PAGE_INVALID,
  })
  .int(CommonErrorMessages.PAGE_INVALID)
  .positive(CommonErrorMessages.PAGE_INVALID)
  .default(1)

export const limitSchema = z.coerce
  .number({
    required_error: CommonErrorMessages.LIMIT_REQUIRED,
    invalid_type_error: CommonErrorMessages.LIMIT_INVALID,
  })
  .int(CommonErrorMessages.LIMIT_INVALID)
  .positive(CommonErrorMessages.LIMIT_INVALID)
  .default(10)

// Types
export type MessageRes = z.infer<typeof MessageResSchema>
export type EmptyBody = z.infer<typeof EmptyBodySchema>
