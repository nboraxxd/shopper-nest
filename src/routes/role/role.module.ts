import { Module } from '@nestjs/common'

import { RoleController } from 'src/routes/role/role.controller'
import { RoleService } from 'src/routes/role/role.service'
import { RoleRepository } from 'src/routes/role/role.repo'

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
})
export class RoleModule {}
