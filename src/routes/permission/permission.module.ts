import { Module } from '@nestjs/common'

import { PermissionController } from 'src/routes/permission/permission.controller'
import { PermissionService } from 'src/routes/permission/permission.service'
import { PermissionRepository } from 'src/routes/permission/permission.repo'

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository],
})
export class PermissionModule {}
