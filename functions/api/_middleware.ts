const RESOLVE_TOKEN_SQL = `
SELECT users.*
FROM users
JOIN user_tokens ON users.id = user_tokens.user_id
WHERE user_tokens.id = ?;
`

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
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-access-token')
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
  if (token) {
    const user = await context.env.DB.prepare(RESOLVE_TOKEN_SQL).bind(token).first<User>()
    context.data.user = user
  } else {
    context.data.user = null
  }
  return context.next()
}

export const onRequest = [errorHandler, cors, auth]
