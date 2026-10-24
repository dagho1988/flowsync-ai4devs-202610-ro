import { apiFetch } from '@/lib/api'

/** Fields exposed by `backend/app/transformers/user_transformer.ts`. */
export type User = {
  id: number
  fullName: string | null
  email: string
  createdAt: string
  updatedAt: string | null
  initials: string
}

export type AuthResponse = {
  user: User
  token: string
}

export type SignupInput = {
  fullName: string | null
  email: string
  password: string
  passwordConfirmation: string
}

export type LoginInput = {
  email: string
  password: string
}

export function signup(input: SignupInput) {
  return apiFetch<AuthResponse>('auth/signup', { method: 'POST', body: input })
}

export function login(input: LoginInput) {
  return apiFetch<AuthResponse>('auth/login', { method: 'POST', body: input })
}

export function getProfile(token: string) {
  return apiFetch<User>('account/profile', { token })
}

export function logout(token: string) {
  return apiFetch<unknown>('account/logout', { method: 'POST', token })
}
