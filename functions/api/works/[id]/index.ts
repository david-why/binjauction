import { obfuscatePhone } from "$/utils"

const GET_WORK_SQL = `
WITH RankedBids AS (
    SELECT
        b.work_id,
        b.user_id,
        b.id AS highest_bid_id,
        b.amount AS highest_bid,
        b.timestamp AS highest_bid_timestamp,
        ROW_NUMBER() OVER (PARTITION BY b.work_id ORDER BY b.amount DESC) AS rank
    FROM bids b
)
SELECT
    w.id AS work_id,
    w.name AS work_name,
    w.description,
    w.img,
    w.minBid,
    rb.highest_bid_id,
    rb.highest_bid,
    rb.highest_bid_timestamp,
    u.id AS user_id,
    u.name AS user_name,
    u.role AS user_role,
    u.phone AS user_phone
FROM works w
LEFT JOIN RankedBids rb ON w.id = rb.work_id AND rb.rank = 1
LEFT JOIN users u ON rb.user_id = u.id
WHERE w.id = ?;
`

declare interface WorksQueryRow {
  work_id: string
  work_name: string
  description: string
  img: string
  minBid: number
  highest_bid_id: string | null
  highest_bid: number | null
  highest_bid_timestamp: number | null
  user_id: string | null
  user_name: string | null
  user_role: number | null
  user_phone: string | null
}

export const onRequestGet: AuctionPagesFunction = async (context) => {
  const id = context.params.id as string
  const value = await context.env.DB.prepare(GET_WORK_SQL).bind(id).first<WorksQueryRow>()
  if (!value) {
    return Response.json({ error: 'Work not found' }, { status: 404 })
  }
  const work: WorkDetail = {
    id: value.work_id,
    name: value.work_name,
    description: value.description,
    img: value.img,
    minBid: value.minBid,
    highestBid: value.highest_bid_id ? {
      id: value.highest_bid_id,
      amount: value.highest_bid!,
      user: {
        id: value.user_id!,
        name: value.user_name!,
        role: value.user_role!,
        obfsPhone: obfuscatePhone(value.user_phone!),
      },
      timestamp: value.highest_bid_timestamp!,
    } : null,
  }
  return Response.json(work)
}
