import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ACCESS_TOKEN_PAYLOAD } from 'src/shared/constants/common.constant'

import { AccessTokenPayload as AccessTokenPayloadType } from 'src/shared/types/jwt.type'

export const ExtractAccessTokenPayload = createParamDecorator(
  (key: keyof AccessTokenPayloadType | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    const accessTokenPayload: AccessTokenPayloadType | undefined = request[ACCESS_TOKEN_PAYLOAD]

    return key ? accessTokenPayload?.[key] : accessTokenPayload
  }
)
