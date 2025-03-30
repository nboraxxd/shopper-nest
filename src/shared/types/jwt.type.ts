export interface AccessTokenPayloadSign {
  userId: number
  deviceId: number
  roleId: number
  roleName: string
}

export interface AccessTokenPayload extends AccessTokenPayloadSign {
  id: string
  iat: string
  exp: number
}

export interface RefreshTokenPayloadSign {
  userId: number
  exp?: number
}

export interface RefreshTokenPayload extends RefreshTokenPayloadSign {
  id: string
  iat: string
  exp: number
}
