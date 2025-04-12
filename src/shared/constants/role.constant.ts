export const RoleName = {
  Admin: 'ADMIN',
  Client: 'CLIENT',
  Seller: 'SELLER',
} as const

export type RoleName = (typeof RoleName)[keyof typeof RoleName]

export const HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const

export type HTTPMethod = (typeof HTTPMethod)[keyof typeof HTTPMethod]
