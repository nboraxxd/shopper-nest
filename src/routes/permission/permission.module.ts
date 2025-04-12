import { Module } from '@nestjs/common'

import { PermissionController } from 'src/routes/permission/permission.controller'
import { PermissionService } from 'src/routes/permission/permission.service'
import { PermissionRepesitory } from 'src/routes/permission/permission.repo'

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepesitory],
})
export class PermissionModule {}
