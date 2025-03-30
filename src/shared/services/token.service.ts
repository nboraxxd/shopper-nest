import { JwtService } from '@nestjs/jwt'
import { Injectable } from '@nestjs/common'

import omitBy from 'lodash/omitBy'
import { v7 as uuidv7 } from 'uuid'
import isUndefined from 'lodash/isUndefined'

import envConfig from 'src/shared/env-config'
import {
  AccessTokenPayloadSign,
  RefreshTokenPayloadSign,
  RefreshTokenPayload,
  AccessTokenPayload,
} from 'src/shared/types/jwt.type'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken({ deviceId, roleId, roleName, userId }: AccessTokenPayloadSign) {
    return this.jwtService.signAsync(
      { deviceId, roleId, roleName, userId, id: uuidv7() },
      {
        algorithm: 'HS256',
        secret: envConfig.ACCESS_TOKEN_SECRET,
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
      }
    )
  }

  signRefreshToken({ userId, exp }: RefreshTokenPayloadSign) {
    return this.jwtService.signAsync(
      omitBy({ userId, exp, id: uuidv7() }, isUndefined),
      omitBy(
        {
          algorithm: 'HS256',
          secret: envConfig.REFRESH_TOKEN_SECRET,
          expiresIn: !exp ? envConfig.REFRESH_TOKEN_EXPIRES_IN : undefined,
        },
        isUndefined
      )
    )
  }

  decodeToken<T extends RefreshTokenPayload | AccessTokenPayload>(token: string) {
    return this.jwtService.decode<T>(token)
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verifyAsync<AccessTokenPayload>(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
    })
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
    })
  }
}
