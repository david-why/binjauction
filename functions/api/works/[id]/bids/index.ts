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

const GET_BIDS_SQL = `
SELECT
    b.id,
    b.amount,
    b.timestamp,
    b.user_id,
    u.name AS user_name,
    u.role AS user_role,
    u.phone AS user_phone
FROM bids b
JOIN users u ON b.user_id = u.id
WHERE b.work_id = ?
ORDER BY b.amount DESC, b.timestamp ASC;
`

interface OutbidResult {
  work_name: string
  phone: string
}

interface GetBidsResult {
  id: string
  amount: number
  timestamp: number
  user_id: string
  user_name: string
  user_role: number
  user_phone: string
}

export const onRequestGet: AuctionPagesFunction = async (context) => {
  checkAdmin(context)
  const workId = context.params.id as string
  const bidsResult = await context.env.DB.prepare(GET_BIDS_SQL).bind(workId).all<GetBidsResult>()
  const bids: BidAdmin[] = bidsResult.results.map((bid) => ({
    id: bid.id,
    amount: bid.amount,
    timestamp: bid.timestamp,
    user: {
      id: bid.user_id,
      name: bid.user_name,
      role: bid.user_role,
      phone: bid.user_phone
    }
  }))
  return Response.json(bids)
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
