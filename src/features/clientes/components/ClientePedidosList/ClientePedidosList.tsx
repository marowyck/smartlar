import { EmptyState } from '@/components/common/EmptyState'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { StatusBadge } from '@/features/pedidos/components/StatusBadge'
import type { PedidoResumo } from '@/features/pedidos/types'
import { formatDataHora } from '@/utils/format'
import { formatBRL, numeroPedido } from '@/utils/money'

export function ClientePedidosList({
  pedidos,
  isLoading,
  error,
  onRetry,
  onAbrirPedido,
}: {
  pedidos: PedidoResumo[] | undefined
  isLoading: boolean
  error: unknown
  onRetry: () => void
  onAbrirPedido: (id: string) => void
}) {
  return (
    <div className="space-y-2">
      <p className="font-medium">Pedidos deste cliente</p>
      <QueryBoundary isLoading={isLoading} error={error} onRetry={onRetry}>
        {pedidos && pedidos.length > 0 ? (
          <ul className="space-y-2">
            {pedidos.map((pedido) => (
              <li key={pedido.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left"
                  onClick={() => onAbrirPedido(pedido.id)}
                >
                  <span>
                    <span className="block font-medium">{numeroPedido(pedido.numero)}</span>
                    <span className="text-xs text-muted-foreground">{formatDataHora(pedido.created_at)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <StatusBadge status={pedido.status} />
                    <span className="tabular-nums">{formatBRL(pedido.valor_total)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Este cliente ainda não tem pedidos" />
        )}
      </QueryBoundary>
    </div>
  )
}
