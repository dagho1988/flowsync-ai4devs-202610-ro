import { ApiError } from '@/lib/api'

const NETWORK_ERROR =
  'No se pudo conectar con el servidor. Revisa que el backend esté en marcha.'
const GENERIC_ERROR = 'Algo salió mal. Inténtalo de nuevo.'

export type FormErrors = {
  form?: string
  fields: Record<string, string>
}

const fieldMessages: Record<string, Record<string, string>> = {
  email: {
    'database.unique': 'Ya existe una cuenta con este email.',
    email: 'Introduce un email válido.',
    required: 'El email es obligatorio.',
  },
  password: {
    minLength: 'La contraseña debe tener al menos 8 caracteres.',
    maxLength: 'La contraseña no puede tener más de 32 caracteres.',
    required: 'La contraseña es obligatoria.',
  },
  passwordConfirmation: {
    sameAs: 'Las contraseñas no coinciden.',
    required: 'Confirma la contraseña.',
  },
}

function fallbackMessage(error: unknown) {
  return error instanceof ApiError && error.status === 0
    ? NETWORK_ERROR
    : GENERIC_ERROR
}

/**
 * Maps a failed login to a user-facing message. The backend answers
 * bad credentials with 400 and a field-less error.
 */
export function loginErrorMessage(error: unknown): string {
  if (
    error instanceof ApiError &&
    (error.status === 400 || error.status === 422)
  ) {
    return 'Email o contraseña incorrectos.'
  }
  return fallbackMessage(error)
}

/**
 * Maps a failed signup to per-field messages, keyed like the form inputs.
 */
export function signupErrors(error: unknown): FormErrors {
  if (!(error instanceof ApiError) || error.status !== 422) {
    return { form: fallbackMessage(error), fields: {} }
  }

  const fields: Record<string, string> = {}
  for (const { field, rule, message } of error.errors) {
    if (!field || fields[field]) continue
    fields[field] = (rule && fieldMessages[field]?.[rule]) ?? message
  }

  return Object.keys(fields).length > 0
    ? { fields }
    : { form: GENERIC_ERROR, fields }
}
