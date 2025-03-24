import { obfuscatePhone } from "$/utils"

const GET_WORKS_SQL = `
SELECT
    w.id AS work_id,
    w.name AS work_name,
    w.description,
    w.img,
    w.min_bid AS minBid,
    w.hidden,
    b.id AS highest_bid_id,
    b.amount AS highest_bid,
    b.timestamp AS highest_bid_timestamp,
    b.user_name AS user_name,
    b.phone AS user_phone
FROM works w
LEFT JOIN bids b ON w.id = b.work_id AND b.amount = (
    SELECT MAX(amount) FROM bids WHERE work_id = w.id
);
`

declare interface WorksQueryRow {
  work_id: number
  work_name: string
  description: string
  img: string
  minBid: number
  hidden: boolean
  highest_bid_id: number | null
  highest_bid: number | null
  highest_bid_timestamp: number | null
  user_name: string | null
  user_phone: string | null
}

export const onRequestGet: AuctionPagesFunction = async (context) => {
  const value = await context.env.DB.prepare(GET_WORKS_SQL).run<WorksQueryRow>()
  let works: WorkDetail[] = value.results.map((row) => ({
    id: row.work_id,
    name: row.work_name,
    description: row.description,
    img: row.img,
    minBid: row.minBid,
    hidden: row.hidden,
    highestBid: row.highest_bid_id ? {
      id: row.highest_bid_id,
      amount: row.highest_bid!,
      userName: row.user_name!,
      obfsPhone: obfuscatePhone(row.user_phone!),
      timestamp: row.highest_bid_timestamp!,
    } : null,
  }))
  if (!context.data.isAdmin) {
    works = works.filter((work) => !work.hidden)
  }
  return Response.json(works)
}

export const onRequestPost: AuctionPagesFunction = async (context) => {
  const body = await context.request.json<Work>()
  await context.env.DB.prepare(`
    INSERT INTO works (name, description, img, min_bid)
    VALUES (?, ?, ?, ?);
  `).bind(body.name, body.description, body.img, body.minBid).run()
  return Response.json({}, { status: 201 })
}
