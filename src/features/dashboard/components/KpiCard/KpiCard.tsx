import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function KpiCard({
  titulo,
  valor,
  detalhe,
  to,
  icon,
  destaque = false,
}: {
  titulo: string
  valor: string
  detalhe: string
  to: string
  icon: ReactNode
  destaque?: boolean
}) {
  return (
    <Link to={to} className="block">
      <Card variant="interactive" className={destaque ? 'bg-primary text-primary-foreground ring-primary' : undefined}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className={destaque ? 'text-primary-foreground/80' : 'text-muted-foreground'}>{titulo}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{valor}</p>
          <p className={destaque ? 'mt-1 text-xs text-primary-foreground/80' : 'mt-1 text-xs text-muted-foreground'}>{detalhe}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
