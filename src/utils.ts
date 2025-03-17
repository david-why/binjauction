import { ref } from "vue"

export function getDisplayBid(bid: Bid | null | undefined): string {
  if (bid) {
    const user = bid.user.isSelf ? 'You' : `${bid.user.name}, ${bid.user.obfsPhone}`
    return `¥${bid.amount} (${user})`
  }
  return 'No bid yet'
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result: Partial<T> = {}
  keys.forEach(key => {
    result[key] = obj[key]
  })
  return result as Pick<T, K>
}

export const title = ref('')
