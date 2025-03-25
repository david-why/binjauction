import { checkAdmin } from "$/utils"

export const onRequestDelete: AuctionPagesFunction = async (context) => {
  checkAdmin(context)
  const id = Number(context.params.id as string)
  await context.env.DB.prepare("DELETE FROM bids WHERE id = ?").bind(id).run()
  return Response.json({})
}
