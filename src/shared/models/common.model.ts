import { z } from 'zod'

export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Name is required' })
  .max(100, { message: 'Name is too long' })

export const emailSchema = z.string({ required_error: 'Email is required' }).trim().email({ message: 'Invalid email' })

export const phoneNumberSchema = z
  .string()
  .min(1, 'phone number is required')
  .regex(/(?:\+84|0084|0)[235789][0-9]{1,2}[0-9]{7}(?:[^\d]+|$)/, 'Invalid phone number')

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(6, { message: 'Password must be at least 6 characters' })
  .max(100, { message: 'Password must be at most 100 characters' })

export const codeSchema = z.string().length(6, { message: 'Code must be 6 characters' })

export const MessageResSchema = z.object({ message: z.string() })

export type MessageRes = z.infer<typeof MessageResSchema>
