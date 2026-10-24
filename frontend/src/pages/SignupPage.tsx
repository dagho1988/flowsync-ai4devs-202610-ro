import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '@/auth/auth-context'
import { AuthCard } from '@/components/AuthCard'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { toFormErrors, type FormErrors } from '@/lib/errors'

const FIELDS = ['fullName', 'email', 'password', 'passwordConfirmation'] as const
type Field = (typeof FIELDS)[number]
type Values = Record<Field, string>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Mirrors `signupValidator` in backend/app/validators/user.ts; the backend stays the source of truth. */
function validate(values: Values): FormErrors<Field>['fields'] {
  const fields: FormErrors<Field>['fields'] = {}
  const email = values.email.trim()

  if (!email) fields.email = 'Este campo es obligatorio.'
  else if (!EMAIL_PATTERN.test(email)) fields.email = 'Introduce un email válido.'
  else if (email.length > 254) fields.email = 'El email no puede superar los 254 caracteres.'

  if (values.password.length < 8)
    fields.password = 'La contraseña debe tener al menos 8 caracteres.'
  else if (values.password.length > 32)
    fields.password = 'La contraseña no puede superar los 32 caracteres.'

  if (values.passwordConfirmation !== values.password)
    fields.passwordConfirmation = 'Las contraseñas no coinciden.'

  return fields
}

export function SignupPage() {
  const { token, signup } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState<Values>({
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })
  const [errors, setErrors] = useState<FormErrors<Field>>({ fields: {} })
  const [submitting, setSubmitting] = useState(false)

  if (token && !submitting) return <Navigate to="/profile" replace />

  function update(field: Field) {
    return (event: ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const fields = validate(values)
    if (Object.keys(fields).length > 0) {
      setErrors({ fields })
      return
    }

    setSubmitting(true)
    setErrors({ fields: {} })
    try {
      await signup({
        fullName: values.fullName.trim() || null,
        email: values.email.trim(),
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      })
      navigate('/profile', { replace: true })
    } catch (error) {
      setErrors(toFormErrors(error, FIELDS))
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Crear cuenta"
      description="Regístrate con tu email y una contraseña."
      error={errors.general}
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="fullName"
          label="Nombre (opcional)"
          autoComplete="name"
          value={values.fullName}
          onChange={update('fullName')}
          error={errors.fields.fullName}
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={update('email')}
          error={errors.fields.email}
        />
        <FormField
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          required
          value={values.password}
          onChange={update('password')}
          error={errors.fields.password}
        />
        <FormField
          id="passwordConfirmation"
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          required
          value={values.passwordConfirmation}
          onChange={update('passwordConfirmation')}
          error={errors.fields.passwordConfirmation}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthCard>
  )
}
