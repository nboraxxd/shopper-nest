'use server'

import { Resend } from 'resend'
import { Injectable } from '@nestjs/common'

import envConfig from 'src/shared/env-config'

@Injectable()
export class MailingService {
  private readonly resend: Resend

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  sendOTP({ code, subject, to }: { to: string; subject: string; code: string }) {
    return this.resend.emails.send({
      from: `Shopper <${envConfig.RESEND_SENDER_EMAIL}>`,
      to,
      subject,
      html: `<strong>${code}</strong>`,
    })
  }
}
