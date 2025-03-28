import { createZodDto } from 'nestjs-zod'

import { RegisterBodySchema, RegisterResSchema, UserSchema } from 'src/routes/auth/auth.model'

export class UserDto extends createZodDto(UserSchema) {}

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export class RegisterResDto extends createZodDto(RegisterResSchema) {}
