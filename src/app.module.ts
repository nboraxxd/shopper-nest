import { Module } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'

import { SharedModule } from 'src/shared/shared.module'

import { AppService } from './app.service'
import { AppController } from './app.controller'
import { AuthModule } from './routes/auth/auth.module'
import CustomZodValidationPipe from 'src/shared/pipes/custom-zod-validation.pipe'

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
  ],
})
export class AppModule {}
