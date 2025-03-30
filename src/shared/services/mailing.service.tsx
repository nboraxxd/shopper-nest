'use server'

import React from 'react'
import { Resend } from 'resend'
import { Injectable } from '@nestjs/common'

import OTPTemplate from 'emails/otp'
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
      react: <OTPTemplate title={`Shopper - ${code} là mã OTP của bạn`} expiration="5 phút" validationCode={code} />,
    })
  }
}
