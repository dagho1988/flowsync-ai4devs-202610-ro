import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '@/auth/auth-context'
import { AuthCard } from '@/components/AuthCard'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { toFormErrors, type FormErrors } from '@/lib/errors'

const FIELDS = ['email', 'password'] as const
type Field = (typeof FIELDS)[number]

export function LoginPage() {
  const { token, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors<Field>>({ fields: {} })
  const [submitting, setSubmitting] = useState(false)

  if (token && !submitting) return <Navigate to="/profile" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setErrors({ fields: {} })
    try {
      await login({ email: email.trim(), password })
      navigate('/profile', { replace: true })
    } catch (error) {
      setErrors(toFormErrors(error, FIELDS))
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Iniciar sesión"
      description="Entra con tu email y contraseña."
      error={errors.general}
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/signup" className="font-medium text-foreground underline underline-offset-4">
            Regístrate
          </Link>
        </>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.fields.email}
        />
        <FormField
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.fields.password}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthCard>
  )
}
