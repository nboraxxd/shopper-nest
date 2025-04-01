import { Response } from 'express'
import { ZodSerializerDto } from 'nestjs-zod'
import { Body, Controller, Get, HttpCode, Ip, Post, Query, Res, UnauthorizedException } from '@nestjs/common'

import envConfig from 'src/shared/env-config'
import { MessageResDto } from 'src/shared/dtos/common.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import ZodLocalValidationPipe from 'src/shared/pipes/zod-local-validation.pipe'

import {
  ForgotPasswordBodyDto,
  GoogleLinkResDto,
  LoginBodyDto,
  LoginResDto,
  RefreshTokenBodyDto,
  RefreshTokenResDto,
  RegisterBodyDto,
  RegisterResDto,
  SendOTPBodyDto,
} from 'src/routes/auth/auth.dto'
import { AuthService } from 'src/routes/auth/auth.service'
import { GoogleService } from 'src/routes/auth/google.service'
import { RequiredGoogleStateError } from 'src/routes/auth/error.model'
import { ErrorMessages, SuccessMessages } from 'src/routes/auth/auth.constant'
import { GoogleCallbackQuery, LogoutBody, LogoutBodySchema } from 'src/routes/auth/auth.model'

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

    return { data: result, message: SuccessMessages.REGISTER_SUCCESSFUL }
  }

  @Post('otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDto)
  @HttpCode(200)
  async sendOTP(@Body() body: SendOTPBodyDto): Promise<MessageResDto> {
    await this.authService.sendOTP(body)

    return { message: SuccessMessages.OTP_SENT }
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDto)
  @HttpCode(200)
  async login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @Ip() ip: string): Promise<LoginResDto> {
    const result = await this.authService.login({ ...body, userAgent, ip })

    return { data: result, message: SuccessMessages.LOGIN_SUCCESSFUL }
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

    return { data: result, message: SuccessMessages.REFRESH_TOKEN_SUCCESSFUL }
  }

  @Post('logout')
  @IsPublic()
  @ZodSerializerDto(MessageResDto)
  @HttpCode(200)
  async logout(
    @Body(new ZodLocalValidationPipe(LogoutBodySchema, 'body', UnauthorizedException)) body: LogoutBody
  ): Promise<MessageResDto> {
    await this.authService.logout(body)

    return { message: SuccessMessages.LOGOUT_SUCCESSFUL }
  }

  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GoogleLinkResDto)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string): GoogleLinkResDto {
    const url = this.googleService.getAuthorizationUrl({ userAgent, ip })

    return { data: { url }, message: SuccessMessages.GET_GOOGLE_LINK_SUCCESSFUL }
  }

  @Get('google/callback')
  @IsPublic()
  async googleCallback(@Query() query: GoogleCallbackQuery, @Res() res: Response) {
    const { code, state } = query

    try {
      if (!state) {
        throw RequiredGoogleStateError
      }

      const result = await this.googleService.handleGoogleCallback({ code, state })

      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : ErrorMessages.GENERIC_GOOGLE_CALLBACK
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?error=${message}`)
    }
  }

  @Post('forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResDto)
  @HttpCode(200)
  async forgotPassword(@Body() body: ForgotPasswordBodyDto): Promise<MessageResDto> {
    await this.authService.forgotPassword(body)

    return { message: SuccessMessages.LOGOUT_SUCCESSFUL }
  }
}
