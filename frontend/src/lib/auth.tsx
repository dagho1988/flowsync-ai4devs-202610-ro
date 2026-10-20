import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const TOKEN_KEY = 'flowsync.token'

type AuthContextValue = {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(readStoredToken)

  const setToken = useCallback((value: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, value)
    } catch {
      // Storage unavailable (private mode): keep the session in memory only.
    }
    setTokenState(value)
  }, [])

  const clearToken = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
    setTokenState(null)
  }, [])

  const value = useMemo(
    () => ({ token, setToken, clearToken }),
    [token, setToken, clearToken],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
