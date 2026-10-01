import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, PageHeader, QueryState } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { listarPedidosDoCliente, obterCliente } from '@/lib/api'
import { formatDataHora } from '@/lib/format'
import { formatBRL, numeroPedido } from '@/lib/money'

export function ClienteDetalhePage() {
  const { id = '' } = useParams()
  const cliente = useQuery({ queryKey: ['clientes', 'detalhe', id], queryFn: () => obterCliente(id), enabled: Boolean(id) })
  const pedidos = useQuery({
    queryKey: ['pedidos', 'cliente', id],
    queryFn: () => listarPedidosDoCliente(id),
    enabled: Boolean(id),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={cliente.data?.nome ?? 'Cliente'}
        description={cliente.data ? `${cliente.data.telefone} · ${cliente.data.endereco}` : undefined}
        action={
          <Button asChild>
            <Link to="/pedidos/novo">Novo pedido</Link>
          </Button>
        }
      />

      <QueryState isLoading={cliente.isLoading} error={cliente.error}>
        {cliente.data ? (
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <p><span className="text-muted-foreground">Telefone: </span>{cliente.data.telefone}</p>
              <p><span className="text-muted-foreground">E-mail: </span>{cliente.data.email || '—'}</p>
              <p className="sm:col-span-2"><span className="text-muted-foreground">Endereço: </span>{cliente.data.endereco}</p>
            </CardContent>
          </Card>
        ) : null}
      </QueryState>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Pedidos deste cliente</h2>
        <QueryState isLoading={pedidos.isLoading} error={pedidos.error}>
          {pedidos.data && pedidos.data.length > 0 ? (
            <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.data.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell>
                        <Link className="font-medium underline-offset-4 hover:underline" to={`/pedidos/${pedido.id}`}>
                          {numeroPedido(pedido.numero)}
                        </Link>
                      </TableCell>
                      <TableCell><StatusBadge status={pedido.status} /></TableCell>
                      <TableCell>{formatBRL(pedido.valor_total)}</TableCell>
                      <TableCell>{formatDataHora(pedido.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState>Este cliente ainda não tem pedidos.</EmptyState>
          )}
        </QueryState>
      </section>
    </div>
  )
}
