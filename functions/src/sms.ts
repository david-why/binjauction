import { createRandomId } from './utils'

async function sha256Hex(data: string) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hmacSha256Hex(key: string, data: string) {
  const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const buffer = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function createSignature(method: string, canonicalUri: string, query: [string, string][], headers: [string, string][], payload: string, accessKeyId: string, accessKeySecret: string) {
  headers.push(['x-acs-date', new Date().toISOString().split('.')[0] + 'Z'])
  headers.push(['x-acs-signature-nonce', createRandomId()])
  const payloadHash = await sha256Hex(payload)
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
  const canonicalRequestHash = await sha256Hex(canonicalRequest)
  const stringToSign = [
    'ACS3-HMAC-SHA256',
    canonicalRequestHash,
  ].join('\n')
  const signature = await hmacSha256Hex(accessKeySecret, stringToSign)
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
  const signature = await createSignature('POST', '/', query, headers, '', env.ALIBABA_CLOUD_ACCESS_KEY_ID, env.ALIBABA_CLOUD_ACCESS_KEY_SECRET)
  headers.push(['Authorization', signature])
  return fetch('https://dysmsapi.aliyuncs.com/?' + new URLSearchParams(query).toString(), {
    method: 'POST',
    headers: Object.fromEntries(headers),
  })
}

export async function sendVerificationCode(phone: string, code: string, env: Env) {
  await sendSMS(phone, env.SMS_SIGN_NAME, env.SMS_VERIFY_TEMPLATE_CODE, { code }, env)
}
