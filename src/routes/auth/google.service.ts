import { v4 as uuidv4 } from 'uuid'
import { google } from 'googleapis'
import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'

import envConfig from 'src/shared/env-config'
import { UserStatus } from 'src/shared/constants/user.constant'
import { HashingService } from 'src/shared/services/hashing.service'
import { UserRepository } from 'src/shared/repositories/user.repo'

import { AuthRepository } from 'src/routes/auth/auth.repo'
import { AuthService } from 'src/routes/auth/auth.service'
import { RolesService } from 'src/routes/auth/roles.service'
import { MissingEmailFromGoogleError } from 'src/routes/auth/auth.error'
import { DevicePayload, GoogleCallbackQuery } from 'src/routes/auth/auth.model'
import { UserModel } from 'src/shared/models/user.model'

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client
  constructor(
    private readonly authService: AuthService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly userRepository: UserRepository
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI
    )
  }

  getAuthorizationUrl({ userAgent, ip }: DevicePayload) {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ]

    const stateString = Buffer.from(JSON.stringify({ userAgent, ip })).toString('base64')

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: stateString,
    })

    return url
  }

  async handleGoogleCallback({ code, state }: Required<GoogleCallbackQuery>) {
    // 1. Lấy thông tin userAgent và ip từ state
    const stateString = Buffer.from(state, 'base64').toString()
    const clientInfo = JSON.parse(stateString) as DevicePayload
    const userAgent = clientInfo.userAgent ?? 'unknown'
    const ip = clientInfo.ip ?? 'unknown'

    try {
      // 2. Lấy thông tin user từ code của Google
      const { tokens } = await this.oauth2Client.getToken(code)
      this.oauth2Client.setCredentials(tokens)

      // 3. Lấy thông tin user từ Google
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client })
      const { data } = await oauth2.userinfo.get()
      if (!data.email) {
        throw MissingEmailFromGoogleError
      }

      let user = await this.userRepository.findUniqueIncludeRole<Pick<UserModel, 'id'>>(
        { email: data.email, deletedAt: null },
        { id: true }
      )

      // Nếu user chưa tồn tại, tiến hành đăng ký user mới
      if (!user) {
        const clientRoleId = await this.rolesService.getClientRoleId()

        const randomPassword = uuidv4()
        const hashedPassword = await this.hashingService.hash(randomPassword)

        user = await this.authRepository.insertUserIncludeRole({
          email: data.email,
          name: data.name ?? data.email.split('@')[0],
          password: hashedPassword,
          roleId: clientRoleId,
          status: UserStatus.ACTIVE,
          avatar: data.picture,
        })
      }

      const device = await this.authRepository.insertDevice({
        userId: user.id,
        ip,
        userAgent,
      })

      const { accessToken, refreshToken } = await this.authService.generateTokens({
        deviceId: device.id,
        roleId: user.role.id,
        roleName: user.role.name,
        userId: user.id,
      })

      await this.authService.saveRefreshToken({ token: refreshToken, deviceId: device.id })

      return { accessToken, refreshToken }
    } catch (error) {
      console.error('🫢 Error when handling Google callback', error)
      throw error
    }
  }
}
