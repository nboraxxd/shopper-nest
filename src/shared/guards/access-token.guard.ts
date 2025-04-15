import { Request } from 'express'
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

import {
  InsufficientPermissionException,
  InvalidAccessTokenException,
  JsonWebTokenException,
  RequiredAccessTokenException,
  RoleNotFoundException,
} from 'src/shared/models/error.model'
import { isJsonWebTokenError } from 'src/shared/utils/errors'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { HTTPMethod } from 'src/shared/constants/role.constant'
import { TokenService } from 'src/shared/services/token.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ACCESS_TOKEN_PAYLOAD } from 'src/shared/constants/common.constant'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService
  ) {}

  private async extractAndVerifyToken(req: Request) {
    const accessToken = req.headers.authorization?.split(' ')[1]

    if (!accessToken) {
      throw RequiredAccessTokenException
    }

    try {
      const accessTokenPayload = await this.tokenService.verifyAccessToken(accessToken)

      return accessTokenPayload
    } catch (error) {
      if (isJsonWebTokenError(error)) {
        throw JsonWebTokenException(error.message)
      } else {
        throw InvalidAccessTokenException
      }
    }
  }

  private async checkUserPermissions(accessTokenPayload: AccessTokenPayload, req: Request): Promise<void> {
    const roleId = accessTokenPayload.roleId
    const path = req.route.path
    const method = req.method as HTTPMethod

    const role = await this.prismaService.role.findUnique({
      where: { id: roleId, deletedAt: null },
      include: {
        permissions: { where: { deletedAt: null, path, method } },
      },
    })

    if (!role) {
      throw RoleNotFoundException
    }

    if (role.permissions.length === 0) {
      throw InsufficientPermissionException
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const accessTokenPayload = await this.extractAndVerifyToken(request)

    // Store the access token payload in the request object for later use
    request[ACCESS_TOKEN_PAYLOAD] = accessTokenPayload

    // Check user permissions
    await this.checkUserPermissions(accessTokenPayload, request)

    return true
  }
}
