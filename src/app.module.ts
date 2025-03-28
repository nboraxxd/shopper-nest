import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { AppController } from './app.controller'
import { SharedModule } from 'src/shared/shared.module'
import { AuthModule } from './routes/auth/auth.module'

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
