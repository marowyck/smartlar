import { useMemo } from 'react'
import { CirclePlus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { usePainel } from '@/store/painel-context'
import { useNovoPedido } from '@/features/pedidos/context/novo-pedido-context'
import { RecordActions } from '@/components/common/RecordActions'
import { usePedidos } from '@/features/pedidos/hooks/usePedidos'
import { STATUS_LABEL, STATUS_PEDIDO, isStatusPedido, type StatusPedido } from '@/features/pedidos/domain/status'
import { EmptyState } from '@/components/common/EmptyState'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { StatusBadge } from '@/features/pedidos/components/StatusBadge'
import { cn } from '@/utils/cn'
import { formatDataHora } from '@/utils/format'
import { formatBRL, numeroPedido } from '@/utils/money'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const filtros = ['todos', ...STATUS_PEDIDO] as const

export function PedidosPage() {
  const { abrir } = useNovoPedido()
  const { abrirPedido } = usePainel()
  const [params, setParams] = useSearchParams()
  const statusParam = params.get('status')
  const status: StatusPedido | 'todos' = isStatusPedido(statusParam) ? statusParam : 'todos'
  const pedidos = usePedidos('todos')
  const lista = useMemo(
    () => (pedidos.data ?? []).filter((pedido) => status === 'todos' || pedido.status === status),
    [pedidos.data, status],
  )
  const contagem = useMemo(() => {
    const mapa = new Map<string, number>()
    for (const pedido of pedidos.data ?? []) {
      mapa.set(pedido.status, (mapa.get(pedido.status) ?? 0) + 1)
    }
    return mapa
  }, [pedidos.data])

  return (
    <PageContainer>
      <PageHeader
        title="Pedidos"
        description="Acompanhe o fluxo: orçamento, aprovado, agendado, em andamento e concluído."
        action={
          <Button onClick={() => abrir()}>
            Novo pedido
            <CirclePlus data-icon="inline-end" />
          </Button>
        }
      />
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar por status">
        {filtros.map((filtro) => {
          const ativo = status === filtro
          const total = filtro === 'todos' ? (pedidos.data?.length ?? 0) : (contagem.get(filtro) ?? 0)
          return (
            <button
              key={filtro}
              type="button"
              role="tab"
              aria-selected={ativo}
              onClick={() => {
                if (filtro === 'todos') setParams({})
                else setParams({ status: filtro })
              }}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-sm',
                ativo ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground',
              )}
            >
              {filtro === 'todos' ? 'Todos' : STATUS_LABEL[filtro]}{' '}
              <span className="tabular-nums">{total}</span>
            </button>
          )
        })}
      </div>
      <QueryBoundary isLoading={pedidos.isLoading} error={pedidos.error} onRetry={() => void pedidos.refetch()}>
        {lista.length > 0 ? (
          <>
            <ul className="space-y-3 md:hidden">
              {lista.map((pedido) => (
                <li key={pedido.id}>
                  <button
                    type="button"
                    className="w-full rounded-xl bg-card p-4 text-left shadow-sm ring-1 ring-foreground/10"
                    onClick={() => abrirPedido(pedido.id, 'ver')}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-medium">{numeroPedido(pedido.numero)}</span>
                      <span className="tabular-nums">{formatBRL(pedido.valor_total)}</span>
                    </span>
                    <span className="mt-1 block">{pedido.cliente_nome}</span>
                    <span className="mt-2 flex items-center justify-between gap-2">
                      <StatusBadge status={pedido.status} />
                      <RecordActions onVer={() => abrirPedido(pedido.id, 'ver')} onEditar={() => abrirPedido(pedido.id, 'editar')} />
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
                  {lista.map((pedido) => (
                    <TableRow key={pedido.id} className="cursor-pointer" onClick={() => abrirPedido(pedido.id, 'ver')}>
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
                        <RecordActions onVer={() => abrirPedido(pedido.id, 'ver')} onEditar={() => abrirPedido(pedido.id, 'editar')} />
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
    </PageContainer>
  )
}
