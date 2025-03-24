import { checkAdmin } from "$/utils"

export const onRequestGet: AuctionPagesFunction = async (context) => {
  checkAdmin(context)
  return Response.json({})
}
