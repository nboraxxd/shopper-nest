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

  ADMIN_NAME: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PHONE_NUMBER: z.string(),
})

const configServer = envSchema.safeParse(process.env)

if (!configServer.success) {
  console.error('Invalid configuration. Please check your .env file.')

  console.error(configServer.error)
  process.exit(1)
}

const envConfig = configServer.data

export default envConfig
