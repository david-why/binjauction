export const onRequestGet: AuctionPagesFunction = async (context) => {
  const key = context.params.key as string
  const object = await context.env.BUCKET.get(key)
  if (object) {
    const headers = {
      'Cache-Control': 'public, max-age=31536000, immutable',
      etag: object.httpEtag
    }
    return new Response(object.body, { headers })
  }
  return Response.json({ error: 'Not found' }, { status: 404 })
}