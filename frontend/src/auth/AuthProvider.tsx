import { useCallback, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '@/lib/auth-api'
import { AuthContext } from '@/auth/auth-context'

const TOKEN_KEY = 'flowsync.token'

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage unavailable (private mode, blocked): the session lives in memory only.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken)

  const saveToken = useCallback((value: string | null) => {
    writeToken(value)
    setToken(value)
  }, [])

  const login = useCallback(
    async (input: authApi.LoginInput) => {
      const { token } = await authApi.login(input)
      saveToken(token)
    },
    [saveToken],
  )

  const signup = useCallback(
    async (input: authApi.SignupInput) => {
      const { token } = await authApi.signup(input)
      saveToken(token)
    },
    [saveToken],
  )

  const clearSession = useCallback(() => saveToken(null), [saveToken])

  const logout = useCallback(async () => {
    const current = token
    clearSession()
    if (current) await authApi.logout(current).catch(() => {})
  }, [token, clearSession])

  const value = useMemo(
    () => ({ token, login, signup, logout, clearSession }),
    [token, login, signup, logout, clearSession],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
