import { ref } from 'vue'

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL as string

const cachedMe = ref<User | null>()

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken')
}

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

interface FetchInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: Json
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
    headers['Content-Type'] = 'application/json'
    requestBody = JSON.stringify(body)
  }
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, { method, headers, body: requestBody })
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
}

export async function fetchMe() {
  if (cachedMe.value !== undefined) {
    return
  }
  cachedMe.value = null
  try {
    cachedMe.value = await fetchJson<User>(`/me`)
  } catch (error) {
    if (error instanceof FetchError && error.response.status === 401) {
      localStorage.removeItem('accessToken')
    }
    cachedMe.value = undefined
    throw error
  }
}

export { cachedMe as me }
