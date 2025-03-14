import { sendNotification } from "$/sms"
import { checkAdmin, checkAuth, createRandomId } from "$/utils"

const CHECK_ADD_BID_SQL = `
INSERT INTO bids (id, work_id, user_id, amount, timestamp)
SELECT ?, ?, ?, ?, ?
WHERE
    ? >= COALESCE((SELECT MAX(amount) FROM bids WHERE work_id = ?), 90) + 10;
`
const FIND_OUTBID_BID = `
SELECT w.name AS work_name, u.phone
FROM bids b
JOIN users u ON b.user_id = u.id
JOIN works w ON b.work_id = w.id
WHERE b.work_id = ?
AND b.amount = (
    SELECT MAX(amount)
    FROM bids
    WHERE work_id = ?
    AND amount < ?
);
`

interface OutbidResult {
  work_name: string
  phone: string
}

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
  const outbid = await context.env.DB.prepare(FIND_OUTBID_BID).bind(
    workId, workId, body.amount
  ).first<OutbidResult>()
  if (outbid && outbid.phone !== context.data.user!.phone) {
    await sendNotification(outbid.phone, outbid.work_name, context.env)
  }
  return Response.json({ success: true })
}
