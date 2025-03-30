import { ZodSerializerDto } from 'nestjs-zod'
import { Body, Controller, HttpCode, Ip, Post } from '@nestjs/common'

import { MessageResDto } from 'src/shared/dtos/common.dto'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'

import { AuthService } from 'src/routes/auth/auth.service'
import { LoginBodyDto, LoginResDto, RegisterBodyDto, RegisterResDto, SendOTPBodyDto } from 'src/routes/auth/auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
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
  @ZodSerializerDto(MessageResDto)
  @HttpCode(200)
  async sendOTP(@Body() body: SendOTPBodyDto): Promise<MessageResDto> {
    await this.authService.sendOTP(body)

    return { message: 'Please check your email for the OTP code' }
  }

  @Post('login')
  @ZodSerializerDto(LoginResDto)
  @HttpCode(200)
  async login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @Ip() ip: string): Promise<LoginResDto> {
    const result = await this.authService.login({ ...body, userAgent, ip })

    return { data: result, message: 'Login successful' }
  }
}
