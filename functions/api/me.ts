import { checkAuth } from "$/utils"

interface UpdateUserBody {
  name: string
}

export const onRequestGet: AuctionPagesFunction = async (context) => {
  checkAuth(context)
  return Response.json(context.data.user!)
}

export const onRequestPatch: AuctionPagesFunction = async (context) => {
  checkAuth(context)
  const body = await context.request.json<UpdateUserBody>()
  const name = body.name.trim()
  if (!name || name.length > 100 || ['<', '>', '&', '"', "'"].some((c) => name.includes(c))) {
    return Response.json({ error: 'Invalid name' }, { status: 400 })
  }
  const id = context.data.user!.id
  await context.env.DB.prepare('UPDATE users SET name = ? WHERE id = ?').bind(name, id).run()
  return Response.json({})
}
