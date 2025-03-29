import { randomInt } from 'crypto'
import { Prisma } from '@prisma/client'
import { JsonWebTokenError } from '@nestjs/jwt'

export function isJsonWebTokenError(error: any): error is JsonWebTokenError {
  return error instanceof JsonWebTokenError
}

export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

/**
 *
 * @returns A random 6-digit OTP
 */
export const generateOTP = (): string => {
  return String(randomInt(0, 1000000)).padStart(6, '0')
}
