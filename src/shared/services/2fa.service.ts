import * as OTPAuth from 'otpauth'
import { Injectable } from '@nestjs/common'

import envConfig from 'src/shared/env-config'
import { Setup2FADataRes } from 'src/routes/auth/auth.model'

@Injectable()
export class TwoFactorAuthService {
  constructor() {}

  private createTOTP(email: string, secret?: string): OTPAuth.TOTP {
    return new OTPAuth.TOTP({
      issuer: envConfig.APP_NAME,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret ?? new OTPAuth.Secret(),
    })
  }

  // generate secret key and uri for 2FA
  generateTOTPSecret(email: string): Setup2FADataRes {
    const totp = this.createTOTP(email)

    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
    }
  }

  // verify 2FA code
  verifyTOTP(token: string, secret: string): boolean {
    const totp = this.createTOTP('', secret)

    const delta = totp.validate({ token, window: 1 })

    return delta !== null
  }
}
