import { createRandomId, obfuscatePhone } from "$/utils"

const GET_WORKS_SQL = `
SELECT
    w.id AS work_id,
    w.name AS work_name,
    w.description,
    w.img,
    w.minBid,
    w.hidden,
    b.id AS highest_bid_id,
    b.amount AS highest_bid,
    b.timestamp AS highest_bid_timestamp,
    u.id AS user_id,
    u.name AS user_name,
    u.role AS user_role,
    u.phone AS user_phone
FROM works w
LEFT JOIN bids b ON w.id = b.work_id AND b.amount = (
    SELECT MAX(amount) FROM bids WHERE work_id = w.id
)
LEFT JOIN users u ON b.user_id = u.id
`

declare interface WorksQueryRow {
  work_id: string
  work_name: string
  description: string
  img: string
  minBid: number
  hidden: boolean
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
      user: {
        id: row.user_id!,
        name: row.user_name!,
        role: row.user_role!,
        obfsPhone: obfuscatePhone(row.user_phone!),
        isSelf: context.data.user?.id === row.user_id!,
      },
      timestamp: row.highest_bid_timestamp!,
    } : null,
  }))
  if (context.data.user?.role !== 1) {
    works = works.filter((work) => !work.hidden)
  }
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
