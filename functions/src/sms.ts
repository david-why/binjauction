import { createHash, createHmac } from 'crypto'
import { createRandomId } from './utils'

function createSignature(method: string, canonicalUri: string, query: [string, string][], headers: [string, string][], payload: string, accessKeyId: string, accessKeySecret: string) {
  headers.push(['x-acs-date', new Date().toISOString().split('.')[0] + 'Z'])
  headers.push(['x-acs-signature-nonce', createRandomId()])
  const payloadHasher = createHash('sha256')
  payloadHasher.update(payload)
  const payloadHash = payloadHasher.digest('hex')
  headers.push(['x-acs-content-sha256', payloadHash])
  const canonicalQueryString = [...query]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')
  const canonicalHeaderPairs = [...headers]
    .map(([key, value]) => [key.toLowerCase(), value.trim()])
    .filter(([key]) => key.startsWith('x-acs-') || key === 'host' || key === 'content-type')
    .sort((a, b) => a[0].localeCompare(b[0]))
  const canonicalHeaders = canonicalHeaderPairs
    .map(([key, value]) => `${key}:${value}`)
    .join('\n') + '\n'
  const signedHeaders = canonicalHeaderPairs.map(([key]) => key).join(';')
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')
  const canonicalRequestHasher = createHash('sha256')
  canonicalRequestHasher.update(canonicalRequest)
  const canonicalRequestHash = canonicalRequestHasher.digest('hex')
  const stringToSign = [
    'ACS3-HMAC-SHA256',
    canonicalRequestHash,
  ].join('\n')
  const hmac = createHmac('sha256', accessKeySecret)
  hmac.update(stringToSign)
  const signature = hmac.digest('hex')
  return `ACS3-HMAC-SHA256 Credential=${accessKeyId},SignedHeaders=${signedHeaders},Signature=${signature}`
}

async function sendSMS(phone: string, signName: string, templateCode: string, params: Record<string, string>, env: Env) {
  console.log(`Sending SMS ${templateCode} with ${JSON.stringify(params)} to ${phone}`)
  if (env.ENABLE_SMS === 'false') {
    return
  }
  const headers: [string, string][] = [
    ['Host', 'dysmsapi.aliyuncs.com'],
    ['x-acs-action', 'SendSms'],
    ['x-acs-version', '2017-05-25'],
  ]
  const query: [string, string][] = [
    ['PhoneNumbers', phone],
    ['SignName', signName],
    ['TemplateCode', templateCode],
    ['TemplateParam', JSON.stringify(params)],
  ]
  const signature = createSignature('POST', '/', query, headers, '', env.ALIBABA_CLOUD_ACCESS_KEY_ID, env.ALIBABA_CLOUD_ACCESS_KEY_SECRET)
  headers.push(['Authorization', signature])
  return fetch('https://dysmsapi.aliyuncs.com/?' + new URLSearchParams(query).toString(), {
    method: 'POST',
    headers: Object.fromEntries(headers),
  })
}

export async function sendVerificationCode(phone: string, code: string, env: Env) {
  await sendSMS(phone, env.SMS_SIGN_NAME, env.SMS_VERIFY_TEMPLATE_CODE, { code }, env)
}
