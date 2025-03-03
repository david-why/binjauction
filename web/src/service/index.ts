const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL as string

export async function fetchWorks(): Promise<Work[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/works`)
  return await response.json()
}
