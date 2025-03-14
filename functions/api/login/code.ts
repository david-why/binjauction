import { createRandomId } from "$/utils"

interface LoginCodeForm {
  sessionToken: string
  code: string
}

export const onRequestPost: AuctionPagesFunction = async (context) => {
  const body = await context.request.json<LoginCodeForm>()
  const login = await context.env.DB.prepare('SELECT * FROM user_logins WHERE id = ?').bind(body.sessionToken).first<UserLogin>()
  if (!login) {
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }
  if (login.code !== body.code) {
    return Response.json({ error: 'Invalid code' }, { status: 400 })
  }
  if (login.expires_at < Date.now()) {
    return Response.json({ error: 'Session expired' }, { status: 400 })
  }
  await context.env.DB.prepare('DELETE FROM user_logins WHERE id = ?').bind(body.sessionToken).run()
  const token = createRandomId()
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 7
  await context.env.DB.prepare('INSERT INTO user_tokens (id, user_id, expires_at) VALUES (?, ?, ?)').bind(token, login.user_id, expires).run()
  return Response.json({ accessToken: token })
}
