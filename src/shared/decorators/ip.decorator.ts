import requestIp from 'request-ip'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const IP = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest()

  return requestIp.getClientIp(request) || ''
})
