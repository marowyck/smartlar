import { Badge } from '@/shared/ui/badge'
import { STATUS_LABEL, type StatusPedido } from '@/features/pedidos/domain/status'

const classes: Record<StatusPedido, string> = {
  orcamento: 'border-transparent bg-amber-100 text-amber-950',
  aprovado: 'border-transparent bg-sky-100 text-sky-950',
  agendado: 'border-transparent bg-indigo-100 text-indigo-950',
  em_andamento: 'border-transparent bg-violet-100 text-violet-950',
  concluido: 'border-transparent bg-emerald-100 text-emerald-950',
  cancelado: 'border-transparent bg-rose-100 text-rose-950',
}

export function StatusBadge({ status }: { status: StatusPedido }) {
  return (
    <Badge variant="outline" className={classes[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
