import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { CircleAlert } from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiError } from '@/lib/api'
import { getProfile, type User } from '@/lib/auth-api'
import { toFormErrors } from '@/lib/errors'

type State =
  { status: 'loading' } | { status: 'ready'; user: User } | { status: 'error'; message: string }

export function ProfilePage() {
  const { token, logout, clearSession } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState<State>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!token) return
    let cancelled = false

    getProfile(token)
      .then((user) => {
        if (!cancelled) setState({ status: 'ready', user })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          // Expired or revoked token: drop it; RequireAuth sends the user to /login.
          clearSession()
          return
        }
        setState({
          status: 'error',
          message: toFormErrors(error, []).general ?? 'No se pudo cargar tu perfil.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [token, clearSession, reloadKey])

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Tu perfil</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {state.status === 'loading' && (
            <p className="text-sm text-muted-foreground">Cargando perfil…</p>
          )}

          {state.status === 'error' && (
            <>
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
              <Button
                variant="outline"
                onClick={() => {
                  setState({ status: 'loading' })
                  setReloadKey((k) => k + 1)
                }}
              >
                Reintentar
              </Button>
            </>
          )}

          {state.status === 'ready' && (
            <div className="flex items-center gap-4">
              <div
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
              >
                {state.user.initials}
              </div>
              <dl className="grid min-w-0 gap-1 text-sm">
                <dt className="sr-only">Nombre</dt>
                <dd className="truncate font-medium">{state.user.fullName ?? 'Sin nombre'}</dd>
                <dt className="sr-only">Email</dt>
                <dd className="truncate text-muted-foreground">{state.user.email}</dd>
                <dt className="sr-only">Miembro desde</dt>
                <dd className="text-muted-foreground">
                  Miembro desde{' '}
                  {new Date(state.user.createdAt).toLocaleDateString('es', { dateStyle: 'long' })}
                </dd>
              </dl>
            </div>
          )}

          <Button variant="outline" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
