const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api/v1'

export type User = {
  id: number
  fullName: string | null
  email: string
  createdAt: string
  updatedAt: string | null
  initials: string
}

export type AuthPayload = {
  user: User
  token: string
}

export type ApiFieldError = {
  message: string
  field?: string
  rule?: string
}

/**
 * Error thrown for any failed API call. `status` is 0 when the
 * request never reached the server (network error, CORS, backend down).
 */
export class ApiError extends Error {
  readonly status: number
  readonly errors: ApiFieldError[]

  constructor(status: number, errors: ApiFieldError[]) {
    super(errors[0]?.message ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  token?: string | null
}

async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.token) headers.Authorization = `Bearer ${options.token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError(0, [])
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const errors = Array.isArray(payload?.errors) ? payload.errors : []
    throw new ApiError(response.status, errors)
  }

  return payload?.data as T
}

export function login(email: string, password: string) {
  return apiFetch<AuthPayload>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function signup(
  email: string,
  password: string,
  passwordConfirmation: string,
) {
  return apiFetch<AuthPayload>('/auth/signup', {
    method: 'POST',
    // The backend requires fullName to be present, even if null.
    body: { fullName: null, email, password, passwordConfirmation },
  })
}

export function getProfile(token: string) {
  return apiFetch<User>('/account/profile', { token })
}

export function logout(token: string) {
  return apiFetch<unknown>('/account/logout', { method: 'POST', token })
}
