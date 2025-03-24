import { ref, watch, type Ref } from "vue"

export function getDisplayBid(bid: Bid | null | undefined): string {
  if (bid) {
    return `¥${bid.amount} (${bid.userName}, ${bid.obfsPhone})`
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

export function getFullLink(href: string): string | undefined {
  return URL.parse(href, location.href)?.href
}

export function resolveR2(key: string): string {
  return `${import.meta.env.VITE_BUCKET_BASE_URL}/${key}`
}

function localStorageRef<T>(key: string, defaultValue: T): Ref<T> {
  const value = ref(defaultValue) as Ref<T>
  const json = localStorage.getItem(key)
  if (json) {
    value.value = JSON.parse(json)
  }
  watch(value, (value) => {
    localStorage.setItem(key, JSON.stringify(value))
  })
  return value
}

export const userName = localStorageRef('user-name-1', '')
export const phone = localStorageRef('phone-1', '')
export const accessToken = localStorageRef('access-token-1', '')

export const title = ref('')
