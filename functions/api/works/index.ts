interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const value = await context.env.DB.prepare("SELECT * FROM works").run<Work>()
  return new Response(JSON.stringify(value.results));
};
