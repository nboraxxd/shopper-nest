import { JwtService } from '@nestjs/jwt'
import { Injectable } from '@nestjs/common'

import omitBy from 'lodash/omitBy'
import { v7 as uuidv7 } from 'uuid'
import isUndefined from 'lodash/isUndefined'

import envConfig from 'src/shared/env-config'
import { TokenPayload } from 'src/shared/types/jwt.type'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: { userId: number }) {
    return this.jwtService.signAsync(
      { ...payload, _id: uuidv7() },
      {
        algorithm: 'HS256',
        secret: envConfig.ACCESS_TOKEN_SECRET,
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
      }
    )
  }

  signRefreshToken(payload: { userId: number; exp?: number }) {
    return this.jwtService.signAsync(
      omitBy({ ...payload, _id: uuidv7() }, isUndefined),
      omitBy(
        {
          algorithm: 'HS256',
          secret: envConfig.REFRESH_TOKEN_SECRET,
          expiresIn: !payload.exp ? envConfig.REFRESH_TOKEN_EXPIRES_IN : undefined,
        },
        isUndefined
      )
    )
  }

  decodeToken(token: string): TokenPayload {
    return this.jwtService.decode(token)
  }

  verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
    })
  }

  verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
    })
  }
}
