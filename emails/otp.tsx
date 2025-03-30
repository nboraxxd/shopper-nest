import React from 'react'
import { Body, Container, Head, Heading, Html, Img, Section, Text } from '@react-email/components'

interface PlaidVerifyIdentityEmailProps {
  title: string
  expiration: string
  validationCode: string
}

function OTPTemplate({ expiration, title, validationCode }: PlaidVerifyIdentityEmailProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Img src={'https://shopper.io.vn/images/shopper.png'} width="56" height="56" alt="Shopper" style={logo} />
          <Text style={tertiary}>Shopper - Mua sắm trực tuyến dễ dàng hơn</Text>
          <Heading style={secondary}>⬇️ Mã OTP của bạn là:</Heading>
          <Section style={codeContainer}>
            <Text style={code}>{validationCode}</Text>
          </Section>
          <Text style={paragraph}>Mã OTP sẽ hết hạn sau {expiration}</Text>
          <Text style={warn}>⛔ Nếu bạn không yêu cầu mã xác minh, vui lòng bỏ qua email này.</Text>
        </Container>
        <Text style={footer}>From Shopper 😍</Text>
      </Body>
    </Html>
  )
}

OTPTemplate.PreviewProps = {
  validationCode: '144833',
  expiration: '5 phút',
} as PlaidVerifyIdentityEmailProps

export default OTPTemplate

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20,50,70,.2)',
  marginTop: '20px',
  maxWidth: '360px',
  margin: '0 auto',
  padding: '68px 0 68px',
}

const logo = {
  margin: '0 auto',
}

const tertiary = {
  color: '#0a85ea',
  fontSize: '11px',
  fontWeight: 700,
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  height: '16px',
  letterSpacing: '0',
  lineHeight: '16px',
  margin: '16px 8px 8px 8px',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
}

const secondary = {
  marginTop: '12px',
  marginBottom: '0',
  fontFamily: 'HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
  fontSize: '20px',
  fontWeight: 500,
  color: '#000',
  lineHeight: '24px',
  textAlign: 'center' as const,
}

const codeContainer = {
  background: 'rgba(0,0,0,.05)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  verticalAlign: 'middle',
  width: '280px',
}

const code = {
  color: '#000',
  fontFamily: 'HelveticaNeue-Bold',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '6px',
  lineHeight: '40px',
  paddingBottom: '8px',
  paddingTop: '8px',
  margin: '0 auto',
  display: 'block',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#666',
  fontSize: '15px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
  padding: '0 40px',
  margin: '0',
  textAlign: 'center' as const,
}

const warn = {
  color: '#444',
  fontSize: '14px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
  padding: '0 16px',
  margin: '40px 0 0 0',
}

const footer = {
  color: '#000',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0',
  lineHeight: '23px',
  margin: '12px 0 0 0',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
}
