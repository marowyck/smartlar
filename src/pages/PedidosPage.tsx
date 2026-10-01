import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { EmptyState, PageHeader, QueryState } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { listarPedidos } from '@/lib/api'
import { formatDataHora } from '@/lib/format'
import { formatBRL, numeroPedido } from '@/lib/money'
import { STATUS_LABEL, STATUS_PEDIDO, isStatusPedido, type StatusPedido } from '@/lib/status'

const filtros = ['todos', ...STATUS_PEDIDO] as const

export function PedidosPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const statusParam = params.get('status')
  const status: StatusPedido | null = isStatusPedido(statusParam) ? statusParam : null
  const pedidos = useQuery({
    queryKey: ['pedidos', status ?? 'todos'],
    queryFn: () => listarPedidos(status),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Acompanhe o fluxo: orçamento, aprovado, agendado, em andamento e concluído."
        action={
          <Button asChild>
            <Link to="/pedidos/novo">Novo pedido</Link>
          </Button>
        }
      />

      <Tabs
        value={status ?? 'todos'}
        onValueChange={(value) => {
          if (value === 'todos') setParams({})
          else setParams({ status: value })
        }}
      >
        <TabsList className="flex h-auto flex-wrap">
          {filtros.map((filtro) => (
            <TabsTrigger key={filtro} value={filtro}>
              {filtro === 'todos' ? 'Todos' : STATUS_LABEL[filtro]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <QueryState isLoading={pedidos.isLoading} error={pedidos.error}>
        {pedidos.data && pedidos.data.length > 0 ? (
          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Instalação</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.data.map((pedido) => (
                  <TableRow key={pedido.id} className="cursor-pointer" onClick={() => navigate(`/pedidos/${pedido.id}`)}>
                    <TableCell className="font-medium">{numeroPedido(pedido.numero)}</TableCell>
                    <TableCell>
                      <div>{pedido.cliente_nome}</div>
                      <div className="text-xs text-muted-foreground">{pedido.cliente_telefone}</div>
                    </TableCell>
                    <TableCell><StatusBadge status={pedido.status} /></TableCell>
                    <TableCell>{formatDataHora(pedido.data_instalacao)}</TableCell>
                    <TableCell>{pedido.tecnico_nome ?? '—'}</TableCell>
                    <TableCell>{formatBRL(pedido.valor_total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState>Nenhum pedido neste filtro.</EmptyState>
        )}
      </QueryState>
    </div>
  )
}
