import { ref } from 'vue'

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL as string

const cachedMe = ref<User | null>()

function getAccessToken(): string | null {
  return localStorage.getItem('accessToken')
}

export async function fetchWorks(): Promise<WorkDetail[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/works`)
  return await response.json()
}

export async function fetchWork(id: string): Promise<WorkDetail> {
  const response = await fetch(`${BACKEND_BASE_URL}/works/${id}`)
  return await response.json()
}

export async function fetchMe(): Promise<User | null> {
  if (cachedMe.value !== undefined) {
    return cachedMe.value
  }
  const token = getAccessToken()
  if (!token) {
    return null
  }
  const response = await fetch(`${BACKEND_BASE_URL}/me`, { headers: { 'x-access-token': token } })
  return cachedMe.value = response.ok ? await response.json() : null
}

export async function login(phone: string): Promise<boolean> {
  cachedMe.value = undefined
  const response = await fetch(`${BACKEND_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  })
  if (!response.ok) {
    return false
  }
  const { accessToken } = await response.json()
  localStorage.setItem('accessToken', accessToken)
  return true
}
