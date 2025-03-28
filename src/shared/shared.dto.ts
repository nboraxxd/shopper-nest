import { z } from 'zod'

export const nameSchema = z.string().trim().min(1, { message: 'Name is required' })

export const emailSchema = z.string({ required_error: 'Email is required' }).trim().email({ message: 'Invalid email' })

export const phoneNumberSchema = z
  .string()
  .min(1, 'phone number is required')
  .regex(/(?:\+84|0084|0)[235789][0-9]{1,2}[0-9]{7}(?:[^\d]+|$)/, 'Invalid phone number')

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(6, { message: 'Password must be at least 6 characters' })

export class SuccessResDTO<T> {
  data: T
  message: string

  constructor(partial: SuccessResDTO<T>) {
    Object.assign(this, partial)
  }
}

export class MessageResDTO {
  message: string

  constructor(partial: Partial<MessageResDTO>) {
    Object.assign(this, partial)
  }
}
