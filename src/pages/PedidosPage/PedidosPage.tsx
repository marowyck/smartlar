import { CirclePlus } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { PedidosList } from '@/features/pedidos/components/PedidosList'
import { STATUS_LABEL, STATUS_PEDIDO, isStatusPedido, type StatusPedido } from '@/features/pedidos/domain/status'
import { usePedidos } from '@/features/pedidos/hooks/usePedidos'
import { useNovoPedido } from '@/features/pedidos/context/novo-pedido-context'
import { usePainel } from '@/store/painel-context'
import { cn } from '@/utils/cn'

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
      <PedidosList
        pedidos={lista}
        isLoading={pedidos.isLoading}
        error={pedidos.error}
        onRetry={() => void pedidos.refetch()}
        onAbrir={abrirPedido}
      />
    </PageContainer>
  )
}
