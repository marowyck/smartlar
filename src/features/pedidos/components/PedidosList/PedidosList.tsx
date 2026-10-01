import { EmptyState } from '@/components/common/EmptyState'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { RecordActions } from '@/components/common/RecordActions'
import { StatusBadge } from '@/features/pedidos/components/StatusBadge'
import type { PedidoResumo } from '@/features/pedidos/types'
import type { ModoPainel } from '@/store/painel-context'
import { formatDataHora } from '@/utils/format'
import { formatBRL, numeroPedido } from '@/utils/money'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function PedidosList({
  pedidos,
  isLoading,
  error,
  onRetry,
  onAbrir,
}: {
  pedidos: PedidoResumo[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
  onAbrir: (id: string, modo: ModoPainel) => void
}) {
  return (
    <QueryBoundary isLoading={isLoading} error={error} onRetry={onRetry}>
      {pedidos.length > 0 ? (
        <>
          <ul className="space-y-3 md:hidden">
            {pedidos.map((pedido) => (
              <li key={pedido.id}>
                <button
                  type="button"
                  className="w-full rounded-xl bg-card p-4 text-left shadow-sm ring-1 ring-foreground/10"
                  onClick={() => onAbrir(pedido.id, 'ver')}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{numeroPedido(pedido.numero)}</span>
                    <span className="tabular-nums">{formatBRL(pedido.valor_total)}</span>
                  </span>
                  <span className="mt-1 block">{pedido.cliente_nome}</span>
                  <span className="mt-2 flex items-center justify-between gap-2">
                    <StatusBadge status={pedido.status} />
                    <RecordActions onVer={() => onAbrir(pedido.id, 'ver')} onEditar={() => onAbrir(pedido.id, 'editar')} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-foreground/10 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Instalação</TableHead>
                  <TableHead className="hidden xl:table-cell">Técnico</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id} className="cursor-pointer" onClick={() => onAbrir(pedido.id, 'ver')}>
                    <TableCell className="font-medium">{numeroPedido(pedido.numero)}</TableCell>
                    <TableCell>
                      <div>{pedido.cliente_nome}</div>
                      <div className="text-xs text-muted-foreground">{pedido.cliente_telefone}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={pedido.status} />
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap lg:table-cell">{formatDataHora(pedido.data_instalacao)}</TableCell>
                    <TableCell className="hidden xl:table-cell">{pedido.tecnico_nome ?? '—'}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">{formatBRL(pedido.valor_total)}</TableCell>
                    <TableCell>
                      <RecordActions onVer={() => onAbrir(pedido.id, 'ver')} onEditar={() => onAbrir(pedido.id, 'editar')} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <EmptyState title="Nenhum pedido neste filtro" description="Troque o status ou crie um orçamento novo." />
      )}
    </QueryBoundary>
  )
}
