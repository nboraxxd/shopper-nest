import { ZodSerializerDto } from 'nestjs-zod'
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'

import { MessageResDto } from 'src/shared/dtos/common.dto'
import { ExtractAccessTokenPayload } from 'src/shared/decorators/extract-access-token-payload.decorator'

import {
  CreateRoleBodyDto,
  GetRoleResDto,
  GetRolesQueryDto,
  GetRolesResDto,
  RoleParamDto,
  UpdateRoleBodyDto,
} from 'src/routes/role/role.dto'
import { RoleService } from 'src/routes/role/role.service'
import { SuccessMessages } from 'src/routes/role/role.constant'

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ZodSerializerDto(GetRolesResDto)
  async list(@Query() query: GetRolesQueryDto): Promise<GetRolesResDto> {
    const { limit, page, isActive } = query

    const result = await this.roleService.list({ limit, page, isActive })

    return { message: SuccessMessages.GET_ROLES_SUCCESSFUL, ...result }
  }

  @Get(':id')
  @ZodSerializerDto(GetRoleResDto)
  async detail(@Param() param: RoleParamDto): Promise<GetRoleResDto> {
    const result = await this.roleService.detail(param.id)

    return { message: SuccessMessages.GET_ROLE_SUCCESSFUL, data: result }
  }

  @Post()
  @ZodSerializerDto(MessageResDto)
  async createRole(
    @Body() body: CreateRoleBodyDto,
    @ExtractAccessTokenPayload('userId') userId: number
  ): Promise<MessageResDto> {
    await this.roleService.create({ ...body, userId })

    return { message: SuccessMessages.CREATE_ROLE_SUCCESSFUL }
  }

  @Patch(':id')
  @ZodSerializerDto(MessageResDto)
  async updateRole(
    @Param() param: RoleParamDto,
    @Body() body: UpdateRoleBodyDto,
    @ExtractAccessTokenPayload('userId') userId: number
  ): Promise<MessageResDto> {
    await this.roleService.update(param.id, { ...body, userId })

    return { message: SuccessMessages.UPDATE_ROLE_SUCCESSFUL }
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResDto)
  async deleteRole(
    @Param() param: RoleParamDto,
    @ExtractAccessTokenPayload('userId') userId: number
  ): Promise<MessageResDto> {
    await this.roleService.delete(param.id, userId)

    return { message: SuccessMessages.DELETE_ROLE_SUCCESSFUL }
  }
}
