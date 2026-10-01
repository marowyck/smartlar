import { STATUS_LABEL, STATUS_PEDIDO, type StatusPedido } from '@/features/pedidos/domain/status'
import { cn } from '@/utils/cn'

const fluxo = STATUS_PEDIDO.filter((status) => status !== 'cancelado')

export function StatusTimeline({ status }: { status: StatusPedido }) {
  const atual = fluxo.indexOf(status as (typeof fluxo)[number])

  return (
    <ol className="grid gap-3 sm:grid-cols-5">
      {fluxo.map((etapa, index) => {
        const feito = status !== 'cancelado' && atual > index
        const corrente = status === etapa
        return (
          <li
            key={etapa}
            className={cn(
              'rounded-xl border px-3 py-2 text-sm',
              corrente && 'border-primary bg-primary/10 font-medium text-primary',
              feito && 'border-transparent bg-muted text-muted-foreground',
            )}
          >
            <span className="block text-xs text-muted-foreground">{index + 1}</span>
            {STATUS_LABEL[etapa]}
          </li>
        )
      })}
      {status === 'cancelado' ? (
        <li className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive sm:col-span-5">
          {STATUS_LABEL.cancelado}
        </li>
      ) : null}
    </ol>
  )
}
