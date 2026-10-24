import { ApiError, type ApiErrorItem } from '@/lib/api'

export type FormErrors<Field extends string> = {
  /** Message not tied to a specific input (bad credentials, network, server error). */
  general?: string
  fields: Partial<Record<Field, string>>
}

const FIELD_MESSAGES: Record<string, string> = {
  'email.database.unique': 'Ya existe una cuenta con este email.',
  'email.email': 'Introduce un email válido.',
  'email.maxLength': 'El email no puede superar los 254 caracteres.',
  'password.minLength': 'La contraseña debe tener al menos 8 caracteres.',
  'password.maxLength': 'La contraseña no puede superar los 32 caracteres.',
  'passwordConfirmation.sameAs': 'Las contraseñas no coinciden.',
  'passwordConfirmation.minLength': 'La contraseña debe tener al menos 8 caracteres.',
  'passwordConfirmation.maxLength': 'La contraseña no puede superar los 32 caracteres.',
}

function fieldMessage(item: ApiErrorItem): string {
  if (item.rule === 'required') return 'Este campo es obligatorio.'
  return FIELD_MESSAGES[`${item.field}.${item.rule}`] ?? item.message
}

/** Turns an error thrown by `apiFetch` into Spanish messages for a form. */
export function toFormErrors<Field extends string>(
  error: unknown,
  fields: readonly Field[],
): FormErrors<Field> {
  const result: FormErrors<Field> = { fields: {} }

  if (!(error instanceof ApiError)) {
    result.general = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
    return result
  }

  if (error.status === 0) {
    result.general = 'No se pudo conectar con el servidor. Comprueba tu conexión.'
  } else if (error.status === 400) {
    result.general = 'Email o contraseña incorrectos.'
  } else if (error.status === 422) {
    for (const item of error.errors) {
      const field = fields.find((f) => f === item.field)
      if (field && !result.fields[field]) result.fields[field] = fieldMessage(item)
      else if (!field) result.general ??= item.message
    }
  } else {
    result.general = 'El servidor no pudo procesar la solicitud. Inténtalo más tarde.'
  }

  return result
}
