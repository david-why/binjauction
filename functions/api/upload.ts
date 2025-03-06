import { createRandomId } from "$/utils"

export const onRequestPost: AuctionPagesFunction = async (context) => {
  const body = context.request.body!
  const id = createRandomId()
  const object = await context.env.BUCKET.put(id, body)
  if (object) {
    return Response.json({ key: object.key }, { status: 201 })
  }
  return Response.json({ error: 'Failed to upload', key: null }, { status: 500 })
}
