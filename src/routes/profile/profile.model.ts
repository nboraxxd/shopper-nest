import { z } from 'zod'

import { validatePasswordMatch } from 'src/shared/utils'
import { CommonErrorMessages } from 'src/shared/constants/common.constant'
import { confirmPasswordSchema, nameSchema, passwordSchema, phoneNumberSchema } from 'src/shared/models/common.model'

import { ErrorMessages } from 'src/routes/profile/profile.constant'

export const UpdateProfileBodySchema = z
  .object({
    name: nameSchema.optional(),
    phoneNumber: phoneNumberSchema.optional(),
    avatar: z
      .string({
        invalid_type_error: ErrorMessages.AVATAR_INVALID,
      })
      .optional(),
  })
  .strict(CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED)

export const ChangePasswordBodySchema = z
  .object({
    password: passwordSchema,
    newPassword: passwordSchema,
    confirmNewPassword: confirmPasswordSchema,
  })
  .strict({ message: CommonErrorMessages.ADDITIONAL_PROPERTIES_NOT_ALLOWED })
  .superRefine((data, ctx) => validatePasswordMatch(data.newPassword, data.confirmNewPassword, ctx))

export type UpdateProfileBody = z.infer<typeof UpdateProfileBodySchema>
export type ChangePasswordBody = z.infer<typeof ChangePasswordBodySchema>
