import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/lib/auth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if (token) return <Navigate to="/profile" replace />
  return children
}
