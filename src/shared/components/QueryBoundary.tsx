import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { mensagemErro } from '@/shared/lib/errors'

export function QueryBoundary({
  isLoading,
  error,
  onRetry,
  children,
}: {
  isLoading: boolean
  error: unknown
  onRetry?: () => void
  children: ReactNode
}) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
        <p>{mensagemErro(error)}</p>
        {onRetry ? (
          <Button className="mt-3" variant="outline" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : null}
      </div>
    )
  }

  return children
}
