import { Navigate, Outlet } from 'react-router-dom'
import { ConfiguracaoAusente } from '@/features/auth/components/ConfiguracaoAusente'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Skeleton } from '@/shared/ui/skeleton'

export function ProtectedRoute() {
  const { session, loading, configurado } = useAuth()

  if (!configurado) return <ConfiguracaoAusente />
  if (loading) {
    return (
      <div className="space-y-3 p-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}
