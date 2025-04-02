import { createZodDto } from 'nestjs-zod'

import { EmptyBodySchema, MessageResSchema } from 'src/shared/models/common.model'

export class MessageResDto extends createZodDto(MessageResSchema) {}

export class EmptyBodyDto extends createZodDto(EmptyBodySchema) {}
