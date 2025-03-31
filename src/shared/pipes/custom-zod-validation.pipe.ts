import { ZodError, ZodSchema } from 'zod'
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common'

// Hàm helper để lấy schema từ metadata hoặc DTO
const getZodSchemaFromMetadata = (metadata: ArgumentMetadata): ZodSchema | undefined => {
  // metadata.metatype chứa class của DTO (nếu có)
  const metatype = metadata.metatype as any
  if (metatype && metatype.schema) {
    return metatype.schema as ZodSchema // Lấy schema từ DTO
  }
  return undefined
}

@Injectable()
class CustomZodValidationPipe implements PipeTransform {
  async transform<T>(value: T, metadata: ArgumentMetadata) {
    const location = metadata.type // Lấy location từ metadata

    // Lấy schema từ metadata hoặc DTO
    const schema = getZodSchemaFromMetadata(metadata)

    if (!schema) {
      return value
    }

    try {
      const parsedData = (await schema.parseAsync(value)) as T

      return parsedData
    } catch (error) {
      if (error instanceof ZodError) {
        if (location === 'body') {
          throw new UnprocessableEntityException({
            message: `Validation error occurred in ${location}`,
            errors: error.errors.map((e) => ({
              message: e.message,
              path: e.path.join('.'),
              location,
            })),
          })
        } else {
          throw new BadRequestException({
            message: `Error occurred in ${location}`,
            location,
            errors: error.errors.map((e) => ({
              message: e.message,
              path: e.path.join('.'),
            })),
          })
        }
      }
      throw error
    }
  }
}

export default CustomZodValidationPipe
