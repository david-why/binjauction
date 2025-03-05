import { createRandomId } from "../../../utils"

interface CreateWork {
  name: string
  description: string
  img: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json<CreateWork>()
  const id = createRandomId()
  const value = await context.env.DB.prepare('INSERT INTO works (id, name, description, img) VALUES (?, ?, ?, ?)').bind(id, body.name, body.description, body.img).run()
  return Response.json(value.results)
}
