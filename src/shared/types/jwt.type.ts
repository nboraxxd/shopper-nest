export interface AccessTokenPayloadSign {
  userId: number
  deviceId: number
  roleId: number
  roleName: string
}

export interface AccessTokenPayload extends AccessTokenPayloadSign {
  iat: number
  exp: number
}

export interface RefreshTokenPayloadSign {
  userId: number
  exp?: number
}

export interface RefreshTokenPayload extends RefreshTokenPayloadSign {
  iat: number
  exp: number
}
