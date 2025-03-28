import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

import { emailSchema, nameSchema, passwordSchema, phoneNumberSchema } from 'src/shared/shared.dto'

// Định nghĩa schema cho request body
const registerBodySchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phoneNumber: phoneNumberSchema,
    password: passwordSchema,
    confirmPassword: z
      .string({ required_error: 'confirmPassword is required' })
      .min(6, { message: 'confirmPassword must be at least 6 characters' }),
  })
  .strict({ message: 'Additional properties not allowed' })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

// Tạo DTO từ schema
export class RegisterBodyDto extends createZodDto(registerBodySchema) {}
