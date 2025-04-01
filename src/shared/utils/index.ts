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
export const generateSuccessResSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    message: z.string(),
    data: dataSchema,
  })
