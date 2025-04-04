import { Module } from '@nestjs/common'

import { LanguageController } from 'src/routes/language/language.controller'
import { LanguageService } from 'src/routes/language/language.service'
import { LanguageRepesitory } from 'src/routes/language/language.repo'

@Module({
  controllers: [LanguageController],
  providers: [LanguageService, LanguageRepesitory],
})
export class LanguageModule {}
