import { createZodDto } from 'nestjs-zod'

import { UserSchema } from 'src/shared/models/shared-user.model'
import { generateSuccessResSchema } from 'src/shared/models/common.model'

import { RegisterBodySchema, RegisterDataResSchema, SendOTPBodySchema } from 'src/routes/auth/auth.model'

export class UserDto extends createZodDto(UserSchema) {}

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export class RegisterResDto extends createZodDto(generateSuccessResSchema(RegisterDataResSchema)) {}

export class SendOtpBodyDto extends createZodDto(SendOTPBodySchema) {}
