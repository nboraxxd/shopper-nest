import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { SuccessResDTO } from 'src/shared/shared.dto'

export interface Response<T> {
  data: T
  message: string
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: SuccessResDTO<T>) => {
        const ctx = context.switchToHttp()
        const response = ctx.getResponse()

        return { ...data, statusCode: response.statusCode }
      })
    )
  }
}
