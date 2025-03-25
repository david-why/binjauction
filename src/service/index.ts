import { accessToken, pick } from '@/utils'

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL as string

export function getAccessToken(): string {
  return accessToken.value
}

type Json = string | number | boolean | null | Json[] | object

interface FetchInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: Json | FormData
  admin?: boolean
}

class FetchError extends Error {
  constructor(public response: Response) {
    super(response.statusText)
  }
}

async function fetchJson<T>(path: string, { method = 'GET', headers = {}, body, admin }: FetchInit = {}): Promise<T> {
  const token = getAccessToken()
  if (token && admin) {
    headers['x-access-token'] = token
  }
  let requestBody = undefined
  if (body !== undefined) {
    if (body instanceof FormData) {
      requestBody = body
    } else {
      requestBody = JSON.stringify(body)
      headers['Content-Type'] = 'application/json'
    }
  }
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, { method, headers, body: requestBody })
  if (!response.ok) {
    throw new FetchError(response)
  }
  return await response.json()
}

export async function fetchWorks() {
  return await fetchJson<WorkDetail[]>(`/works`, { admin: true }) // hidden
}

export async function fetchWork(id: number) {
  return await fetchJson<WorkDetail>(`/works/${id}`, { admin: true }) // hidden
}

export async function placeBid(workId: number, phone: string, userName: string, amount: number) {
  await fetchJson(`/works/${workId}/bids`, {
    method: 'POST',
    body: { phone, userName, amount },
  })
}

export async function upload(file: Blob) {
  const formData = new FormData()
  formData.append('file', file)
  const resp = await fetchJson<{ key: string }>(`/upload`, {
    method: 'POST',
    body: formData,
    admin: true,
  })
  return resp
}

export async function createWork(work: Omit<Work, 'id' | 'hidden'>) {
  await fetchJson<{ id: string }>(`/works`, {
    method: 'POST',
    body: work,
    admin: true,
  })
}

export async function updateWork(work: Work) {
  await fetchJson(`/works/${work.id}`, {
    method: 'PUT',
    body: pick(work, ['name', 'description', 'minBid', 'hidden']),
    admin: true,
  })
}

export async function deleteWork(id: number) {
  await fetchJson(`/works/${id}`, { method: 'DELETE', admin: true })
}

export async function fetchBids(workId: number) {
  return await fetchJson<BidAdmin[]>(`/works/${workId}/bids`, { admin: true })
}

export async function checkAdmin() {
  try {
    await fetchJson(`/auth/check`, { admin: true })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

let cachedConfig: Config | null = null

export async function fetchConfig(force: boolean = false) {
  if (!force && cachedConfig) {
    return cachedConfig
  }
  return cachedConfig = await fetchJson<Config>('/config')
}

export async function setConfig(config: Config) {
  await fetchJson('/config', {
    method: 'PUT',
    body: config,
    admin: true,
  })
  cachedConfig = null
}
