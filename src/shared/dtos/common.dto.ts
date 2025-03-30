import { createZodDto } from 'nestjs-zod'

import { MessageResSchema } from 'src/shared/models/common.model'

export class MessageResDto extends createZodDto(MessageResSchema) {}
