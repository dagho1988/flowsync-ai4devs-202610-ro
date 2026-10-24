import { createContext, useContext } from 'react'
import type { LoginInput, SignupInput } from '@/lib/auth-api'

export type AuthContextValue = {
  token: string | null
  login: (input: LoginInput) => Promise<void>
  signup: (input: SignupInput) => Promise<void>
  /** Revokes the token on the backend (best effort) and clears the local session. */
  logout: () => Promise<void>
  /** Clears the local session without calling the backend (e.g. after a 401). */
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
