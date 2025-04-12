import { ZodSerializerDto } from 'nestjs-zod'
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'

import { MessageResDto } from 'src/shared/dtos/common.dto'
import { ExtractAccessTokenPayload } from 'src/shared/decorators/extract-access-token-payload.decorator'

import {
  CreatePermissionBodyDto,
  PermissionParamDto,
  GetPermissionResDto,
  GetPermissionsQueryDto,
  GetPermissionsResDto,
  UpdatePermissionBodyDto,
} from 'src/routes/permission/permission.dto'
import { SuccessMessages } from 'src/routes/permission/permission.constant'
import { PermissionService } from 'src/routes/permission/permission.service'

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ZodSerializerDto(GetPermissionsResDto)
  async list(@Query() query: GetPermissionsQueryDto): Promise<GetPermissionsResDto> {
    const { limit, page } = query

    const result = await this.permissionService.list({ limit, page })

    return { message: SuccessMessages.GET_PERMISSIONS_SUCCESSFUL, ...result }
  }

  @Get(':id')
  @ZodSerializerDto(GetPermissionResDto)
  async detail(@Param() param: PermissionParamDto): Promise<GetPermissionResDto> {
    const result = await this.permissionService.detail(param.id)

    return { message: SuccessMessages.GET_PERMISSION_SUCCESSFUL, data: result }
  }

  @Post()
  @ZodSerializerDto(MessageResDto)
  async create(
    @Body() body: CreatePermissionBodyDto,
    @ExtractAccessTokenPayload('userId') userId: number
  ): Promise<MessageResDto> {
    await this.permissionService.create({ ...body, userId })

    return { message: SuccessMessages.CREATE_PERMISSION_SUCCESSFUL }
  }

  @Patch(':id')
  @ZodSerializerDto(MessageResDto)
  async update(
    @Param() param: PermissionParamDto,
    @Body() body: UpdatePermissionBodyDto,
    @ExtractAccessTokenPayload('userId') userId: number
  ): Promise<MessageResDto> {
    await this.permissionService.update(param.id, { ...body, userId })

    return { message: SuccessMessages.UPDATE_PERMISSION_SUCCESSFUL }
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResDto)
  async delete(
    @Param() param: PermissionParamDto,
    @ExtractAccessTokenPayload('userId') userId: number
  ): Promise<MessageResDto> {
    await this.permissionService.delete(param.id, userId)

    return { message: SuccessMessages.DELETE_PERMISSION_SUCCESSFUL }
  }
}
