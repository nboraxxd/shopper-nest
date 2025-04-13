import { NestFactory } from '@nestjs/core'

import { AppModule } from 'src/app.module'
import { PermissionModel } from 'src/shared/models/permission.model'
import { PrismaService } from 'src/shared/services/prisma.service'

type PermissionItem = Pick<PermissionModel, 'name' | 'description' | 'method' | 'path'>

const prisma = new PrismaService()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3010)
  const server = app.getHttpAdapter().getInstance()
  const router = server.router

  // Get all permissions in db
  const permissionsInDb = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  })

  // Create permissionInDbMap object with key is [method-path]
  const permissionInDbMap = permissionsInDb.reduce<Record<string, PermissionItem>>((acc, item) => {
    const key = `${item.method}-${item.path}`
    acc[key] = item
    return acc
  }, {})

  // Get all routes in the app
  const availableRoutes: PermissionItem[] = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path
        const method = String(layer.route?.stack[0].method).toUpperCase()
        return {
          name: `${method} ${path}`,
          path,
          method,
          description: `Permission for ${method} ${path}`,
        }
      }
    })
    .filter((item) => item !== undefined)

  // Create availableRoutesMap object with key is [method-path]
  const availableRoutesMap = availableRoutes.reduce<Record<string, PermissionItem>>((acc, item) => {
    const key = `${item.method}-${item.path}`
    acc[key] = item
    return acc
  }, {})

  // Find permission in db that not exist in application (availableRoutesMap)
  const permissionsToDelete = permissionsInDb.filter((item) => {
    const key = `${item.method}-${item.path}`
    return !availableRoutesMap[key]
  })

  if (permissionsToDelete.length > 0) {
    // Delete permissions in db that not exist in availableRoutes
    const deleteResult = await prisma.permission.updateMany({
      where: {
        id: {
          in: permissionsToDelete.map((item) => item.id),
        },
      },
      data: {
        deletedAt: new Date(),
      },
    })
    console.log('🤩 Xoá mềm permission thành công. Số permission đã xóa:', deleteResult.count)
  } else {
    console.log('🫢 Không có permission nào bị xóa.')
  }

  // Find routes exist in application but not exist in db (permissionInDbMap)
  const routesToAdd = availableRoutes.filter((item) => {
    const key = `${item.method}-${item.path}`
    return !permissionInDbMap[key]
  })

  if (routesToAdd.length > 0) {
    // Add new permissions to db (routes that exist in application but not exist in db)
    const createResult = await prisma.permission.createMany({
      data: routesToAdd,
      skipDuplicates: true,
    })
    console.log('🤩 Tạo permission thành công. Số permission đã tạo:', createResult.count)
  } else {
    console.log('🫢 Không có permission nào mới được tạo.')
  }

  await app.close()
  process.exit(0)
}
bootstrap()
