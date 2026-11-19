import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuthSession } from '@/features/auth/hooks/useAuthSession'

interface RequireAuthProps {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { loading, user } = useAuthSession()

  if (loading) {
    return <p className="text-muted-foreground p-8 text-sm">Cargando sesión…</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
