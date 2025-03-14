import { checkAdmin, checkAuth, createRandomId } from "$/utils"

const CHECK_ADD_BID_SQL = `
INSERT INTO bids (id, work_id, user_id, amount, timestamp)
SELECT ?, ?, ?, ?, ?
WHERE
    ? >= COALESCE((SELECT MAX(amount) FROM bids WHERE work_id = ?), 90) + 10;
`

export const onRequestGet: AuctionPagesFunction = async (context) => {
  checkAdmin(context)
  // TODO
  return Response.json({ error: 'Not implemented' }, { status: 501 })
}

interface BidForm {
  amount: number
}

export const onRequestPost: AuctionPagesFunction = async (context) => {
  checkAuth(context)
  const workId = context.params.id as string
  const bidId = createRandomId()
  const userId = context.data.user!.id
  const timestamp = Date.now()
  const body = await context.request.json<BidForm>()
  const result = await context.env.DB.prepare(CHECK_ADD_BID_SQL).bind(
    bidId, workId, userId, body.amount, timestamp, body.amount, workId
  ).run()
  if (result.meta.changes === 0) {
    return Response.json({ error: 'Invalid bid' }, { status: 409 })
  }
  return Response.json({ success: true })
}
