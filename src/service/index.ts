import { pick } from '@/utils'
import { ref } from 'vue'

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL as string

const cachedMe = ref<User | null>()

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken')
}

type Json = string | number | boolean | null | Json[] | object

interface FetchInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: Json | FormData
}

class FetchError extends Error {
  constructor(public response: Response) {
    super(response.statusText)
  }
}

async function fetchJson<T>(path: string, { method = 'GET', headers = {}, body }: FetchInit = {}): Promise<T> {
  const token = getAccessToken()
  if (token) {
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
  if (response.headers.get('x-token-invalid') === '1') {
    cachedMe.value = null
    localStorage.removeItem('accessToken')
  }
  if (!response.ok) {
    throw new FetchError(response)
  }
  return await response.json()
}

export async function fetchWorks() {
  return await fetchJson<WorkDetail[]>(`/works`)
}

export async function fetchWork(id: string) {
  return await fetchJson<WorkDetail>(`/works/${id}`)
}

export async function placeBid(workId: string, amount: number) {
  await fetchJson(`/works/${workId}/bids`, {
    method: 'POST',
    body: { amount },
  })
}

export async function login(phone: string) {
  cachedMe.value = undefined
  localStorage.removeItem('accessToken')
  const response = await fetchJson<{ sessionToken: string }>(`/login`, {
    method: 'POST',
    body: { phone },
  });
  return response.sessionToken
}

export async function verify(sessionToken: string, code: string) {
  const response = await fetchJson<{ accessToken: string }>(`/login/code`, {
    method: 'POST',
    body: { sessionToken, code },
  });
  localStorage.setItem('accessToken', response.accessToken)
  fetchMe() // don't await because it's fine
}

export async function logout() {
  cachedMe.value = null
  localStorage.removeItem('accessToken')
  await fetchJson(`/logout`, { method: 'POST' })
}

export async function fetchMe() {
  if (cachedMe.value !== undefined) {
    return cachedMe.value
  }
  try {
    cachedMe.value = await fetchJson<User>(`/me`)
    return cachedMe.value
  } catch (error) {
    if (error instanceof FetchError && error.response.status === 401) {
      localStorage.removeItem('accessToken')
    }
    cachedMe.value = undefined
    throw error
  }
}

export async function upload(file: Blob) {
  const formData = new FormData()
  formData.append('file', file)
  const resp = await fetchJson<{ key: string, url: string }>(`/upload`, {
    method: 'POST',
    body: formData,
  })
  return resp
}

export async function createWork(work: Omit<Work, 'id' | 'hidden'>) {
  const { id } = await fetchJson<{ id: string }>(`/works`, {
    method: 'POST',
    body: work,
  })
  return id
}

export async function updateWork(work: Work) {
  await fetchJson(`/works/${work.id}`, {
    method: 'PUT',
    body: pick(work, ['name', 'description', 'minBid', 'hidden']),
  })
}

export async function deleteWork(id: string) {
  await fetchJson(`/works/${id}`, { method: 'DELETE' })
}

export async function fetchBids(workId: string) {
  return await fetchJson<BidAdmin[]>(`/works/${workId}/bids`)
}

export { cachedMe as me }
