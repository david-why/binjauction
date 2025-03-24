import { checkAdmin } from "$/utils"

const CHECK_ADD_BID_SQL = `
INSERT INTO bids (work_id, user_name, phone, amount, timestamp)
SELECT ?, ?, ?, ?, ?
WHERE
    ? BETWEEN
        COALESCE((SELECT MAX(amount) FROM bids WHERE work_id = ?) + 10, 100)
    AND
        COALESCE((SELECT MAX(amount) FROM bids WHERE work_id = ?) + 100, 200);
`

const GET_BIDS_SQL = `
SELECT
    b.id,
    b.amount,
    b.timestamp,
    b.name AS user_name,
    b.phone AS user_phone
FROM bids b
WHERE b.work_id = ?;
`

interface GetBidsResult {
  id: number
  amount: number
  timestamp: number
  user_name: string
  user_phone: string
}

export const onRequestGet: AuctionPagesFunction = async (context) => {
  checkAdmin(context)
  const workId = Number(context.params.id as string)
  const bidsResult = await context.env.DB.prepare(GET_BIDS_SQL).bind(workId).all<GetBidsResult>()
  const bids: BidAdmin[] = bidsResult.results.map((bid) => ({
    id: bid.id,
    amount: bid.amount,
    timestamp: bid.timestamp,
    userName: bid.user_name,
    phone: bid.user_phone
  })).sort((a, b) => b.amount - a.amount)
  return Response.json(bids)
}

interface BidForm {
  phone: string
  userName: string
  amount: number
}

export const onRequestPost: AuctionPagesFunction = async (context) => {
  const workId = Number(context.params.id as string)
  const timestamp = Date.now()
  const body = await context.request.json<BidForm>()
  const userName = body.userName
  const phone = body.phone
  const amount = body.amount
  const result = await context.env.DB.prepare(CHECK_ADD_BID_SQL).bind(
    workId, userName, phone, amount, timestamp, amount, workId, workId
  ).run()
  if (result.meta.changes === 0) {
    return Response.json({ error: 'Invalid bid' }, { status: 409 })
  }
  return Response.json({ success: true })
}
