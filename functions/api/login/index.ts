import { sendVerificationCode } from "$/sms"
import { createRandomId } from "$/utils"

interface LoginForm {
  phone: string
}

export const onRequestPost: AuctionPagesFunction = async (context) => {
  const body = await context.request.json<LoginForm>()
  const user = await context.env.DB.prepare('SELECT id FROM users WHERE phone = ?').bind(body.phone).first<{ id: string }>()
  let userId: string
  if (!user) {
    // create new user
    const id = createRandomId()
    await context.env.DB.prepare('INSERT INTO users (id, phone) VALUES (?, ?)').bind(id, body.phone).run()
    userId = id
  } else {
    userId = user.id
  }
  await context.env.DB.prepare('DELETE FROM user_logins WHERE expires_at < ? OR user_id = ?').bind(Date.now(), userId).run()
  const id = createRandomId()
  const code = Math.random().toString().substring(2, 8)
  const expiresAt = Date.now() + 1000 * 60 * 5
  await context.env.DB.prepare('INSERT INTO user_logins (id, code, user_id, expires_at) VALUES (?, ?, ?, ?)').bind(id, code, userId, expiresAt).run()
  await sendVerificationCode(body.phone, code, context.env)
  return Response.json({ sessionToken: id })
}
