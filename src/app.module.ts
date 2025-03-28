import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { AppController } from './app.controller'
import { SharedModule } from 'src/shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
