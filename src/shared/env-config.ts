import fs from 'fs'
import path from 'path'
import { z } from 'zod'
import { config } from 'dotenv'

config({
  path: '.env',
})

if (!fs.existsSync(path.resolve('.env'))) {
  console.error('No .env file found')
  process.exit(1)
}

const envSchema = z.object({
  DATABASE_URL: z.string(),

  PORT: z.coerce.number().int(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  SECRET_API_KEY: z.string(),
})

const envConfig = envSchema.safeParse(process.env)

if (!envConfig.success) {
  console.error('Invalid configuration. Please check your .env file.')

  console.error(envConfig.error)
  process.exit(1)
}

export default envConfig.data
