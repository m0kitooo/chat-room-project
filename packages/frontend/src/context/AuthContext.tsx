import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '../types'

type AuthState = {
  user: User | null
  accessToken: string | null
}

type AuthContextValue = AuthState & {
  login: (user: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem('auth')
    if (raw) return JSON.parse(raw) as AuthState
  } catch {}
  return { user: null, accessToken: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getStoredAuth)

  const login = (user: User, accessToken: string) => {
    const next: AuthState = { user, accessToken }
    setState(next)
    localStorage.setItem('auth', JSON.stringify(next))
  }

  const logout = () => {
    setState({ user: null, accessToken: null })
    localStorage.removeItem('auth')
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
