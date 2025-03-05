import { createRandomId } from '../utils'

interface LoginForm {
  phone: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json<LoginForm>()
  const value = await context.env.DB.prepare('SELECT id FROM users WHERE phone = ?').bind(body.phone).first<Pick<User, 'id'>>()
  if (!value) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }
  const token = createRandomId()
  const userId = value.id
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 7
  await context.env.DB.prepare('INSERT INTO user_tokens (id, user_id, expires_at) VALUES (?, ?, ?)').bind(token, userId, expires).run()
  return Response.json({ accessToken: token })
}
