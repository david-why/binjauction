declare global {
  interface Env {
    DB: D1Database
    BUCKET: R2Bucket
    BUCKET_BASE_URL: string
    ENABLE_SMS: 'false' | 'true'
    ALIBABA_CLOUD_ACCESS_KEY_ID: string
    ALIBABA_CLOUD_ACCESS_KEY_SECRET: string
    SMS_SIGN_NAME: string
    SMS_VERIFY_TEMPLATE_CODE: string
    SMS_NOTIFY_TEMPLATE_CODE: string
  }
  interface ContextData extends Record<string, unknown> {
    isAdmin: boolean
    accessToken: string | null
  }
  type AuctionPagesFunction<Params extends string = string> = PagesFunction<Env, Params, ContextData>
  type AuctionContext<Params extends string = string> = EventContext<Env, Params, ContextData>
}

export { }
