import { checkAuth } from "$/utils"

export const onRequestPost: AuctionPagesFunction = async (context) => {
  checkAuth(context)
  await context.env.DB.prepare('DELETE FROM user_tokens WHERE id = ?').bind(Date.now(), context.data.accessToken).run()
  return Response.json({})
}
