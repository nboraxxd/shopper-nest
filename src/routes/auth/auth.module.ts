import { Module } from '@nestjs/common'

import { TwoFactorAuthService } from 'src/shared/services/2fa.service'

import { AuthController } from 'src/routes/auth/auth.controller'
import { AuthService } from 'src/routes/auth/auth.service'
import { GoogleService } from 'src/routes/auth/google.service'
import { AuthRepository } from 'src/routes/auth/auth.repo'

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleService, TwoFactorAuthService, AuthRepository],
})
export class AuthModule {}
