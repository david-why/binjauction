import { checkAdmin, createRandomId } from "$/utils"

export const onRequestPost: AuctionPagesFunction = async (context) => {
  checkAdmin(context)
  // image upload only
  const contentType = context.request.headers.get('content-type')
  if (!contentType || !contentType.includes('multipart/form-data')) {
    return Response.json({ error: 'Invalid content type' }, { status: 400 })
  }
  // image only!
  const formData = await context.request.formData()
  const file = formData.get('file') as unknown as File
  console.log(file)
  const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.') + 1) : 'bin'
  const id = createRandomId()
  const key = `${id}.${ext}`
  const object = await context.env.BUCKET.put(key, file)
  if (object) {
    const url = `${context.env.BUCKET_BASE_URL}/${key}`
    return Response.json({ key: object.key, url }, { status: 201 })
  }
  return Response.json({ error: 'Failed to upload', key: null }, { status: 500 })
}
