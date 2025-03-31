import { ZodSchema, ZodError } from 'zod'
import { HttpException, Injectable, PipeTransform } from '@nestjs/common'

export type ValidationLocation = 'body' | 'params' | 'query' | 'headers' | 'file'

@Injectable()
class ZodLocalValidationPipe<T> implements PipeTransform {
  constructor(
    private readonly schema: ZodSchema<T>,
    private readonly location: ValidationLocation,
    private readonly customError: new (error: {
      message: string
      location: string
      errors: Array<{ message: string; path: string }>
    }) => HttpException
  ) {}

  async transform(value: T): Promise<T> {
    try {
      const parsedData = await this.schema.parseAsync(value)

      return parsedData
    } catch (error) {
      if (error instanceof ZodError) {
        throw new this.customError({
          message: `Error occurred in ${this.location}`,
          location: this.location,
          errors: error.errors.map((e) => ({
            message: e.message,
            path: e.path.join('.'),
          })),
        })
      }
      throw error
    }
  }
}

export default ZodLocalValidationPipe
