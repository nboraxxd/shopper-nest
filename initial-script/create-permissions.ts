import { NestFactory } from '@nestjs/core'

import { AppModule } from 'src/app.module'
import { HTTPMethod } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3010)
  const server = app.getHttpAdapter().getInstance()
  const router = server.router

  const availableRoutes = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path
        const method = String(layer.route?.stack[0].method).toUpperCase() as keyof typeof HTTPMethod
        return {
          name: `${method} ${path}`,
          path,
          method,
          description: `Permission for ${method} ${path}`,
        }
      }
    })
    .filter((item) => item !== undefined)

  const result = await prisma.permission.createMany({
    data: availableRoutes,
    skipDuplicates: true,
  })
  console.log('🤩 Tạo seed data thành công. Số permission đã tạo:', result.count)

  await app.close()
  process.exit(0)
}
bootstrap()
