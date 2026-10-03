import { EmptyState } from '@/components/common/EmptyState'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import type { PedidoResumo } from '@/features/pedidos/types'
import { diasDesde, rotuloDias } from '@/utils/format'
import { formatBRL, numeroPedido } from '@/utils/money'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function OrcamentosParados({
  pedidos,
  isLoading,
  error,
  aprovando,
  onRetry,
  onAbrir,
  onAprovar,
}: {
  pedidos: PedidoResumo[]
  isLoading: boolean
  error: unknown
  aprovando: boolean
  onRetry: () => void
  onAbrir: (id: string) => void
  onAprovar: (id: string) => void
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Orçamentos aguardando aprovação</h2>
      <QueryBoundary isLoading={isLoading} error={error} onRetry={onRetry}>
        {pedidos.length > 0 ? (
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <Card key={pedido.id}>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" className="text-left" onClick={() => onAbrir(pedido.id)}>
                    <p className="font-medium">
                      {numeroPedido(pedido.numero)} · {pedido.cliente_nome}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pedido.cliente_telefone} · {rotuloDias(diasDesde(pedido.created_at))}
                    </p>
                    <p className="mt-1 font-semibold tabular-nums">{formatBRL(pedido.valor_total)}</p>
                  </button>
                  <Button disabled={aprovando} onClick={() => onAprovar(pedido.id)}>
                    Aprovar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhum orçamento parado" />
        )}
      </QueryBoundary>
    </section>
  )
}
