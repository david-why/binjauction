export const onRequestGet: AuctionPagesFunction = async (context) => {
  const result = await context.env.DB.prepare('SELECT value FROM config').first<{ value: string }>();
  const config = JSON.parse(result?.value || '{}');
}
