import { Module } from '@nestjs/common'

import { AuthController } from 'src/routes/auth/auth.controller'
import { AuthRepesitory } from 'src/routes/auth/auth.repo'
import { AuthService } from 'src/routes/auth/auth.service'
import { RolesService } from 'src/routes/auth/roles.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService, AuthRepesitory],
})
export class AuthModule {}
