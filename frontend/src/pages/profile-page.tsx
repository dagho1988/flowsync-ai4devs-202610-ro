import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ApiError, getProfile, logout, type User } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export function ProfilePage() {
  const navigate = useNavigate()
  const { token, clearToken } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    getProfile(token)
      .then((profile) => {
        if (!cancelled) setUser(profile)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          // Token expired or revoked: RequireAuth sends us back to /login.
          clearToken()
          return
        }
        setError(
          err instanceof ApiError && err.status === 0
            ? 'No se pudo conectar con el servidor.'
            : 'No se pudo cargar tu perfil.',
        )
      })
    return () => {
      cancelled = true
    }
  }, [token, clearToken])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      if (token) await logout(token)
    } catch {
      // The local session is dropped anyway; a failed revoke is not actionable here.
    }
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center gap-4">
          <div
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground"
          >
            {user?.initials ?? '…'}
          </div>
          <div className="grid gap-1">
            <CardTitle className="text-xl">
              {user ? (user.fullName ?? 'Sin nombre') : 'Tu perfil'}
            </CardTitle>
            <CardDescription>{user?.email ?? 'Cargando…'}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {user && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user.email}</dd>
              <dt className="text-muted-foreground">Miembro desde</dt>
              <dd>{new Date(user.createdAt).toLocaleDateString('es')}</dd>
            </dl>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
