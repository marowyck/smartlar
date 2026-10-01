import { Navigate, Outlet } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { ConfiguracaoAusente } from '@/pages/ConfiguracaoAusente'

export function ProtectedRoute() {
  const { session, loading, configurado } = useAuth()

  if (!configurado) return <ConfiguracaoAusente />
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 p-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}
