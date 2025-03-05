const cors: PagesFunction = async (context) => {
  const response = await context.next()
  const origin = context.request.headers.get('Origin')
  if (origin) {
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
  return response
}

const auth: PagesFunction = async (context) => {
  console.log(context)
  return context.next()
}

export const onRequest = [cors, auth]
