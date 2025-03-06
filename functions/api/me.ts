import { checkAuth } from "$/utils"

export const onRequestGet: AuctionPagesFunction = async (context) => {
  checkAuth(context)
  return Response.json(context.data.user!)
}
