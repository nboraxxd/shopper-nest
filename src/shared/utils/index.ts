import { z } from 'zod'
import { randomInt } from 'crypto'

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
export const generatePaginationListResSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
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
