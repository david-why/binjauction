import { checkAdmin, obfuscatePhone } from "$/utils"

const GET_WORK_SQL = `
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
WHERE w.id = ?
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
    hidden: value.hidden,
    highestBid: value.highest_bid_id ? {
      id: value.highest_bid_id,
      amount: value.highest_bid!,
      user: {
        id: value.user_id!,
        name: value.user_name!,
        role: value.user_role!,
        obfsPhone: obfuscatePhone(value.user_phone!),
        isSelf: context.data.user?.id === value.user_id!,
      },
      timestamp: value.highest_bid_timestamp!,
    } : null,
  }
  return Response.json(work)
}

export const onRequestPut: AuctionPagesFunction = async (context) => {
  checkAdmin(context)
  const id = context.params.id as string
  const { name, description, minBid, hidden } = await context.request.json<Pick<Work, 'name' | 'description' | 'minBid' | 'hidden'>>()
  await context.env.DB.prepare('UPDATE works SET name = ?, description = ?, minBid = ?, hidden = ? WHERE id = ?').bind(name, description, minBid, hidden, id).run()
  return Response.json({})
}

export const onRequestDelete: AuctionPagesFunction = async (context) => {
  checkAdmin(context)
  const id = context.params.id as string
  await context.env.DB.prepare('DELETE FROM works WHERE id = ?').bind(id).run()
  return Response.json({})
}
