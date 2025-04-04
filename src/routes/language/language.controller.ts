import { ZodSerializerDto } from 'nestjs-zod'
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { MessageResDto } from 'src/shared/dtos/common.dto'
import { ExtractAccessTokenPayload } from 'src/shared/decorators/extract-access-token-payload.decorator'

import {
  CreateLanguageBodyDto,
  GetLanguageDetailResDto,
  GetLanguagesResDto,
  LanguageParamDto,
  UpdateLanguageBodyDto,
} from 'src/routes/language/language.dto'
import { LanguageService } from 'src/routes/language/language.service'
import { SuccessMessages } from 'src/routes/language/language.constant'

@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @ZodSerializerDto(GetLanguagesResDto)
  async list(): Promise<GetLanguagesResDto> {
    const { data, totalItems } = await this.languageService.list()

    return { message: SuccessMessages.GET_LANGUAGES_SUCCESSFUL, data, totalItems }
  }

  @Get(':id')
  @ZodSerializerDto(GetLanguageDetailResDto)
  async detail(@Param() param: LanguageParamDto): Promise<GetLanguageDetailResDto> {
    const result = await this.languageService.findById(param.id)

    return { message: SuccessMessages.GET_LANGUAGE_SUCCESSFUL, data: result }
  }

  @Post()
  @ZodSerializerDto(MessageResDto)
  async create(
    @Body() body: CreateLanguageBodyDto,
    @ExtractAccessTokenPayload('userId') userId: number
  ): Promise<MessageResDto> {
    await this.languageService.create({ ...body, userId })

    return { message: SuccessMessages.CREATE_LANGUAGE_SUCCESSFUL }
  }

  @Put(':id')
  @ZodSerializerDto(MessageResDto)
  async update(
    @Param() param: LanguageParamDto,
    @Body() body: UpdateLanguageBodyDto,
    @ExtractAccessTokenPayload('userId') userId: number
  ): Promise<MessageResDto> {
    await this.languageService.update(param.id, { ...body, userId })

    return { message: SuccessMessages.UPDATE_LANGUAGE_SUCCESSFUL }
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResDto)
  async delete(@Param() param: LanguageParamDto): Promise<MessageResDto> {
    await this.languageService.delete(param.id)

    return { message: SuccessMessages.DELETE_LANGUAGE_SUCCESSFUL }
  }
}
