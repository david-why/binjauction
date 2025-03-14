import { createRandomId, obfuscatePhone } from "$/utils"

const GET_WORKS_SQL = `
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
LEFT JOIN users u ON rb.user_id = u.id;
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
  const value = await context.env.DB.prepare(GET_WORKS_SQL).run<WorksQueryRow>()
  const works: WorkDetail[] = value.results.map((row) => ({
    id: row.work_id,
    name: row.work_name,
    description: row.description,
    img: row.img,
    minBid: row.minBid,
    highestBid: row.highest_bid_id ? {
      id: row.highest_bid_id,
      amount: row.highest_bid!,
      user: {
        id: row.user_id!,
        name: row.user_name!,
        role: row.user_role!,
        obfsPhone: obfuscatePhone(row.user_phone!),
      },
      timestamp: row.highest_bid_timestamp!,
    } : null,
  }))
  return Response.json(works)
}

export const onRequestPost: AuctionPagesFunction = async (context) => {
  const body = await context.request.json<Work>()
  const id = createRandomId()
  await context.env.DB.prepare(`
    INSERT INTO works (id, name, description, img, minBid)
    VALUES (?, ?, ?, ?, ?);
  `).bind(id, body.name, body.description, body.img, body.minBid).run()
  return Response.json({ id }, { status: 201 })
}
