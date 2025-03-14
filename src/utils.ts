export function getDisplayBid(bid: Bid | null | undefined): string {
  if (bid) {
    const user = bid.user.isSelf ? 'You' : bid.user.obfsPhone
    return `¥${bid.amount} (${user})`
  }
  return 'No bid yet'
}
