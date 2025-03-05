export const onRequest: PagesFunction<Env> = async (context) => {
  const accessToken = context.request.headers.get('x-access-token')
  if (!accessToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return context.next()
}
