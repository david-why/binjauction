const RESOLVE_TOKEN_SQL = `
SELECT users.*, user_tokens.expires_at AS token_expires_at
FROM users
JOIN user_tokens ON users.id = user_tokens.user_id
WHERE user_tokens.id = ?;
`

interface UserWithToken extends User {
  token_expires_at: number
}

const errorHandler: AuctionPagesFunction = async (context) => {
  try {
    return await context.next()
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function addCorsHeaders(response: Response, origin: string) {
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-access-token')
  response.headers.set('Access-Control-Expose-Headers', 'x-token-invalid')
  const vary = response.headers.get('Vary')
  if (vary) {
    response.headers.set('Vary', vary + ', Origin')
  } else {
    response.headers.set('Vary', 'Origin')
  }
}

const cors: AuctionPagesFunction = async (context) => {
  if (context.request.method === 'OPTIONS') {
    const response = new Response(null, { status: 204 })
    const origin = context.request.headers.get('Origin')
    if (origin) {
      addCorsHeaders(response, origin)
    }
    return response
  }
  const response = await context.next()
  const origin = context.request.headers.get('Origin')
  if (origin) {
    addCorsHeaders(response, origin)
  }
  return response
}

const auth: AuctionPagesFunction = async (context) => {
  const token = context.request.headers.get('x-access-token')
  let isInvalid = false
  if (token) {
    const user = await context.env.DB.prepare(RESOLVE_TOKEN_SQL).bind(token).first<UserWithToken>()
    isInvalid = !user
    if (user && user.token_expires_at < Date.now()) {
      await context.env.DB.prepare('DELETE FROM user_tokens WHERE expires_at < ?').bind(Date.now()).run()
      isInvalid = true
    }
    context.data.user = user
    context.data.accessToken = token
  } else {
    context.data.user = null
    context.data.accessToken = null
  }
  const response = await context.next()
  if (isInvalid) {
    response.headers.set('x-token-invalid', '1')
  }
  return response
}

export const onRequest = [errorHandler, cors, auth]
