import { checkAdmin } from "$/utils"

export const onRequestGet: AuctionPagesFunction = async (context) => {
  const result = await context.env.DB.prepare('SELECT value FROM config').first<{ value: string }>()
  const config = JSON.parse(result?.value || '{}')
  return Response.json(config)
}

export const onRequestPut: AuctionPagesFunction = async (context) => {
  checkAdmin(context)
  const config = await context.request.json()
  const value = JSON.stringify(config)
  const result = await context.env.DB.prepare('UPDATE config SET value = ?').bind(value).run()
  if (result.meta.changes === 0) {
    await context.env.DB.prepare('INSERT INTO config (value) VALUES (?)').bind(value).run()
  }
  return Response.json({})
}
