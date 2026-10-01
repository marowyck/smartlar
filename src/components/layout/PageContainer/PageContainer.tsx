import type { ReactNode } from 'react'

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="page-enter space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</div>
}
