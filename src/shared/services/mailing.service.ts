'use server'

import fs from 'fs'
import { Resend } from 'resend'
import { Injectable } from '@nestjs/common'

import envConfig from 'src/shared/env-config'
import path from 'path'

@Injectable()
export class MailingService {
  private readonly resend: Resend

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  sendOTP({ code, subject, to }: { to: string; subject: string; code: string }) {
    const otpTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), 'utf8')

    return this.resend.emails.send({
      from: `Shopper <${envConfig.RESEND_SENDER_EMAIL}>`,
      to,
      subject,
      html: otpTemplate
        .replace('{{code}}', code)
        .replace('{{subject}}', subject)
        .replace('{{preview}}', subject)
        .replace('{{title}}', 'Xác minh tài khoản Shopper')
        .replace('{{expiry}}', '5 phút'),
    })
  }
}
