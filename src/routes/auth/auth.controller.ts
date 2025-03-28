import { ZodSerializerDto } from 'nestjs-zod'
import { Body, Controller, Post } from '@nestjs/common'

import { AuthService } from 'src/routes/auth/auth.service'
import { RegisterBodyDto, RegisterResDto } from 'src/routes/auth/auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDto)
  async register(@Body() body: RegisterBodyDto) {
    const result = await this.authService.register(body)

    return result
  }
}
