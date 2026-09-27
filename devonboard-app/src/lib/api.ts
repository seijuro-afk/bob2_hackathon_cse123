const AUTH_KEY = 'devonboard.auth'

export interface ApiTask {
  id: string
  order: number
  title: string
  description: string
  automatedCheck: string
  estimatedTime: string
  required: boolean
  tags: string[]
}

export interface CheckResult {
  passed: boolean
  output: string
  durationMs: number
}

export function runTaskCheck(id: string): Promise<CheckResult> {
  return api<CheckResult>(`/tasks/${id}/run`, { method: 'POST' })
}

export interface AuthUser {
  role: 'manager' | 'engineer'
  username: string
}

export interface StoredAuth {
  token: string
  user: AuthUser
}

export function getStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? (JSON.parse(raw) as StoredAuth) : null
  } catch {
    return null
  }
}

export function setStoredAuth(auth: StoredAuth | null): void {
  if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
  else localStorage.removeItem(AUTH_KEY)
}

/** Fetch wrapper for the DevOnboard API. Throws with the server's error message on failure. */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAuth()?.token
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Request failed (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
