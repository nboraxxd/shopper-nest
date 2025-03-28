import { JwtModule } from '@nestjs/jwt'
import { APP_GUARD } from '@nestjs/core'
import { Global, Module } from '@nestjs/common'

import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'
import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'

const sharedServices = [PrismaService, HashingService, TokenService]

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
