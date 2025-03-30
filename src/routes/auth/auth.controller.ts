import { ZodSerializerDto } from 'nestjs-zod'
import { Body, Controller, HttpCode, Post } from '@nestjs/common'

import { MessageResDto } from 'src/shared/shared.dto'
import { AuthService } from 'src/routes/auth/auth.service'
import { LoginBodyDto, LoginResDto, RegisterBodyDto, RegisterResDto, SendOTPBodyDto } from 'src/routes/auth/auth.dto'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { IP } from 'src/shared/decorators/ip.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDto)
  async register(@Body() body: RegisterBodyDto): Promise<RegisterResDto> {
    const result = await this.authService.register(body)

    return { data: result, message: 'User created successfully' }
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
  async login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @IP() ip: string): Promise<LoginResDto> {
    const result = await this.authService.login({ ...body, userAgent, ip })

    return { data: result, message: 'Login successful' }
  }
}
