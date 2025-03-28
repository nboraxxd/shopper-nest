import { ZodError } from 'zod'
import { createZodValidationPipe } from 'nestjs-zod'
import { UnprocessableEntityException } from '@nestjs/common'

const CustomZodValidationPipe = createZodValidationPipe({
  // provide custom validation exception factory
  createValidationException: (error: ZodError) => {
    return new UnprocessableEntityException({
      message: 'Validation error occurred',
      errors: error.errors.map((e) => ({ message: e.message, path: e.path.join('.') })),
    })
  },
})

export default CustomZodValidationPipe
