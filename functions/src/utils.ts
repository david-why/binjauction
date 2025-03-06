export function createRandomId() {
  return Math.random().toString(36).slice(2)
}

export function obfuscatePhone(phone: string) {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
}

export function checkAuth(context: AuctionContext) {
  if (!context.data.user) {
    throw Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export function checkAdmin(context: AuctionContext) {
  checkAuth(context)
  if (context.data.user?.role !== 1) {
    throw Response.json({ error: 'Forbidden' }, { status: 403 })
  }
}
