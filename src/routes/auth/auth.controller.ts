import { ZodSerializerDto } from 'nestjs-zod'
import { Body, Controller, Get, HttpCode, Ip, Post } from '@nestjs/common'

import { MessageResDto } from 'src/shared/dtos/common.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'

import { AuthService } from 'src/routes/auth/auth.service'
import {
  GoogleLinkResDto,
  LoginBodyDto,
  LoginResDto,
  LogoutBodyDto,
  RefreshTokenBodyDto,
  RefreshTokenResDto,
  RegisterBodyDto,
  RegisterResDto,
  SendOTPBodyDto,
} from 'src/routes/auth/auth.dto'
import { GoogleService } from 'src/routes/auth/google.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService
  ) {}

  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDto)
  async register(
    @Body() body: RegisterBodyDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string
  ): Promise<RegisterResDto> {
    const result = await this.authService.register({ ...body, userAgent, ip })

    return { data: result, message: 'Register successful' }
  }

  @Post('otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDto)
  @HttpCode(200)
  async sendOTP(@Body() body: SendOTPBodyDto): Promise<MessageResDto> {
    await this.authService.sendOTP(body)

    return { message: 'Please check your email for the OTP code' }
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDto)
  @HttpCode(200)
  async login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @Ip() ip: string): Promise<LoginResDto> {
    const result = await this.authService.login({ ...body, userAgent, ip })

    return { data: result, message: 'Login successful' }
  }

  @Post('refresh-token')
  @IsPublic()
  @ZodSerializerDto(RefreshTokenResDto)
  @HttpCode(200)
  async refreshToken(
    @Body() body: RefreshTokenBodyDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string
  ): Promise<RefreshTokenResDto> {
    const result = await this.authService.refreshToken({ ...body, userAgent, ip })

    return { data: result, message: 'Refresh token successful' }
  }

  @Post('logout')
  @IsPublic()
  @ZodSerializerDto(MessageResDto)
  @HttpCode(200)
  async logout(@Body() body: LogoutBodyDto): Promise<MessageResDto> {
    await this.authService.logout(body)

    return { message: 'Logout successful' }
  }

  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GoogleLinkResDto)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string): GoogleLinkResDto {
    const url = this.googleService.getAuthorizationUrl({ userAgent, ip })

    return { data: { url }, message: 'Google link' }
  }
}
