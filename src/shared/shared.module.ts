import { JwtModule } from '@nestjs/jwt'
import { APP_GUARD } from '@nestjs/core'
import { Global, Module } from '@nestjs/common'

import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { UserService } from 'src/shared/services/user.service'
import { TokenService } from 'src/shared/services/token.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { MailingService } from 'src/shared/services/mailing.service'
import { TwoFactorAuthService } from 'src/shared/services/2fa.service'
import { UserRepository } from 'src/shared/repositories/user.repo'

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  MailingService,
  UserService,
  TwoFactorAuthService,
  UserRepository,
]

@Global()
@Module({
  exports: [...sharedServices],
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  imports: [JwtModule],
})
export class SharedModule {}
