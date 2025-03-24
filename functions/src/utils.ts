export function createRandomId() {
  return Math.random().toString(36).slice(2)
}

export function obfuscatePhone(phone: string) {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
}

export function checkAdmin(context: AuctionContext) {
  if (!context.data.isAdmin) {
    throw Response.json({ error: 'Forbidden' }, { status: 403 })
  }
}

export function getDefaultMinBid(context: AuctionContext) {
  const minBid = context.data.minBid
  if (typeof minBid !== 'number' || minBid < 100) {
    return 100
  }
  return minBid
}
