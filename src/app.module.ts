import { Module } from '@nestjs/common'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'

import { SharedModule } from 'src/shared/shared.module'
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter'
import CustomZodValidationPipe from 'src/shared/pipes/custom-zod-validation.pipe'
import { TransformInterceptor } from 'src/shared/interceptor/transform.interceptor'

import { AuthModule } from 'src/routes/auth/auth.module'
import { RoleModule } from 'src/routes/role/role.module'
import { ProfileModule } from 'src/routes/profile/profile.module'
import { LanguageModule } from 'src/routes/language/language.module'
import { PermissionModule } from 'src/routes/permission/permission.module'

@Module({
  imports: [SharedModule, AuthModule, LanguageModule, PermissionModule, RoleModule, ProfileModule],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
