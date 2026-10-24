const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

/** One entry of the backend's `{ errors: [...] }` body (VineJS, auth exceptions, ...). */
export type ApiErrorItem = {
  message: string
  rule?: string
  field?: string
}

/** Thrown for any non-2xx response. `status` is 0 when the server could not be reached. */
export class ApiError extends Error {
  status: number
  errors: ApiErrorItem[]

  constructor(status: number, errors: ApiErrorItem[]) {
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

/**
 * Calls the FlowSync API under `/api/v1` and returns the payload unwrapped from the
 * `{ data }` envelope that `ctx.serialize()` adds on the backend.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.token) headers.Authorization = `Bearer ${options.token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}/api/v1/${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError(0, [])
  }

  const json = await response.json().catch(() => null)

  if (!response.ok) {
    const errors = Array.isArray(json?.errors) ? (json.errors as ApiErrorItem[]) : []
    throw new ApiError(response.status, errors)
  }

  return (json?.data ?? json) as T
}
