import type { ReactNode } from 'react'

export type QueryBoundaryProps = {
  isLoading: boolean
  error: unknown
  onRetry?: () => void
  children: ReactNode
}
