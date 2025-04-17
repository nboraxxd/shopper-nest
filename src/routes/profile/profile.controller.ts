import { ZodSerializerDto } from 'nestjs-zod'
import { Body, Controller, Get, HttpCode, Patch, Post, Query } from '@nestjs/common'

import { MessageResDto } from 'src/shared/dtos/common.dto'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { ExtractAccessTokenPayload } from 'src/shared/decorators/extract-access-token-payload.decorator'
import { GetUserProfileQueryDto, GetUserProfileResDto, UpdateUserProfileResDto } from 'src/shared/dtos/user.dto'

import { ProfileService } from 'src/routes/profile/profile.service'
import { SuccessMessages } from 'src/routes/profile/profile.constant'
import { ChangePasswordBodyDto, UpdateProfileBodyDto } from 'src/routes/profile/profile.dto'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(GetUserProfileResDto)
  async getProfile(
    @Query() { include }: GetUserProfileQueryDto,
    @ExtractAccessTokenPayload('userId') userId: AccessTokenPayload['userId']
  ): Promise<GetUserProfileResDto> {
    const data = await this.profileService.getProfile(userId, include)

    return {
      data,
      message: SuccessMessages.GET_PROFILE_SUCCESSFULLY,
    }
  }

  @Patch()
  @ZodSerializerDto(UpdateUserProfileResDto)
  async updateProfile(
    @Body() body: UpdateProfileBodyDto,
    @ExtractAccessTokenPayload('userId') userId: number
  ): Promise<UpdateUserProfileResDto> {
    const data = await this.profileService.updateProfile(userId, body)

    return {
      data,
      message: SuccessMessages.UPDATE_PROFILE_SUCCESSFULLY,
    }
  }

  @Post('change-password')
  @ZodSerializerDto(MessageResDto)
  @HttpCode(200)
  async changePassword(
    @Body() body: ChangePasswordBodyDto,
    @ExtractAccessTokenPayload('userId') userId: number
  ): Promise<MessageResDto> {
    await this.profileService.changePassword(userId, body)

    return {
      message: SuccessMessages.CHANGE_PASSWORD_SUCCESSFULLY,
    }
  }
}
