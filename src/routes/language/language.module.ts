import { Module } from '@nestjs/common'

import { LanguageController } from 'src/routes/language/language.controller'
import { LanguageService } from 'src/routes/language/language.service'
import { LanguageRepository } from 'src/routes/language/language.repo'

@Module({
  controllers: [LanguageController],
  providers: [LanguageService, LanguageRepository],
})
export class LanguageModule {}
