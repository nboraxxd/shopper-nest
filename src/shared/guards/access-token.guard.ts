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
import { TokenService } from 'src/shared/services/token.service'
import { RoleRepository } from 'src/shared/repositories/role.repo'
import { HTTPMethodUnion } from 'src/shared/constants/role.constant'
import { ACCESS_TOKEN_PAYLOAD } from 'src/shared/constants/common.constant'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly roleRepository: RoleRepository
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
    const method = req.method as HTTPMethodUnion

    const role = await this.roleRepository.findActiveRoleById({
      id: roleId,
      method,
      path,
    })

    if (!role) {
      throw RoleNotFoundException
    }

    if (role.permissions.length === 0 || role.isActive === false) {
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
