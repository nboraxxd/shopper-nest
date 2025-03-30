import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { RefreshTokenPayload } from 'src/shared/types/jwt.type'
import { REQUEST_USER_KEY } from 'src/shared/constants/auth.constant'

export const ActiveUser = createParamDecorator(
  (field: keyof RefreshTokenPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    const user: RefreshTokenPayload | undefined = request[REQUEST_USER_KEY]

    return field ? user?.[field] : user
  }
)
