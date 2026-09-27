import { createContext, useContext, useState, type ReactNode } from 'react'
import { api, getStoredAuth, setStoredAuth, type AuthUser } from './api'

interface AuthContextValue {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface LoginResponse {
  token: string
  role: AuthUser['role']
  username: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuth()?.user ?? null)

  const login = async (username: string, password: string) => {
    const res = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    const auth = { token: res.token, user: { role: res.role, username: res.username } }
    setStoredAuth(auth)
    setUser(auth.user)
    return auth.user
  }

  const logout = () => {
    setStoredAuth(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
