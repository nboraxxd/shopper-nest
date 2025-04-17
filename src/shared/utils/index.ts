import { z } from 'zod'
import { randomInt } from 'crypto'

import { CommonErrorMessages } from 'src/shared/constants/common.constant'

/**
 * @returns A random 6-digit OTP
 */
export const generateOTP = (): string => {
  return String(randomInt(0, 1000000)).padStart(6, '0')
}

/**
 * @param dataSchema The schema of the data field
 * @returns The schema of a successful response
 */
export const generateResSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    message: z.string(),
    data: dataSchema,
  })

/**
 * @param dataSchema The schema of the data field
 * @returns The schema of a successful response
 */
export const generateListResSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    message: z.string(),
    data: dataSchema,
    totalItems: z.number(),
  })

/**
 * @param dataSchema The schema of the data field
 * @returns The schema of a successful response
 */
export const generatePagedResSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    message: z.string(),
    data: dataSchema,
    pagination: z.object({
      currentPage: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      totalItems: z.number(),
    }),
  })

/**
 *
 * @param password - The password to be validated
 * @param confirmPassword - The password to be confirmed
 * @param ctx - The Zod refinement context
 * @description A custom validation function to check if the password and confirm password match.
 * If they do not match, it adds a custom issue to the context with a specific error message.
 * @returns void
 * @throws {z.ZodError} If the passwords do not match, a ZodError is thrown with a custom message.
 */
export const validatePasswordMatch = (password: string, confirmPassword: string, ctx: z.RefinementCtx) => {
  if (password !== confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: CommonErrorMessages.PASSWORDS_DO_NOT_MATCH,
      path: ['confirmPassword'],
    })
  }
}
