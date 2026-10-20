import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { AuthLayout } from '@/components/auth-layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signup } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { signupErrors, type FormErrors } from '@/lib/errors'

// Mirrors the backend signupValidator (backend/app/validators/user.ts).
function validate(
  email: string,
  password: string,
  passwordConfirmation: string,
): FormErrors {
  const fields: Record<string, string> = {}
  if (!email.trim()) fields.email = 'El email es obligatorio.'
  if (password.length < 8)
    fields.password = 'La contraseña debe tener al menos 8 caracteres.'
  else if (password.length > 32)
    fields.password = 'La contraseña no puede tener más de 32 caracteres.'
  if (passwordConfirmation !== password)
    fields.passwordConfirmation = 'Las contraseñas no coinciden.'
  return { fields }
}

export function SignupPage() {
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<FormErrors>({ fields: {} })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const clientErrors = validate(email, password, passwordConfirmation)
    setErrors(clientErrors)
    if (Object.keys(clientErrors.fields).length > 0) return

    setSubmitting(true)
    try {
      const { token } = await signup(
        email.trim(),
        password,
        passwordConfirmation,
      )
      setToken(token)
      navigate('/profile', { replace: true })
    } catch (err) {
      setErrors(signupErrors(err))
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      description="Regístrate con tu email y una contraseña."
      footer={
        <p>
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Inicia sesión
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        {errors.form && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{errors.form}</AlertDescription>
          </Alert>
        )}
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={errors.fields.email}
        />
        <Field
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          error={errors.fields.password}
          hint="Entre 8 y 32 caracteres."
        />
        <Field
          id="passwordConfirmation"
          label="Confirma la contraseña"
          type="password"
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={setPasswordConfirmation}
          error={errors.fields.passwordConfirmation}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  )
}

type FieldProps = {
  id: string
  label: string
  type: string
  autoComplete: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
}

function Field({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
  error,
  hint,
}: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
