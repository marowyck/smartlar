import { Link, useParams } from 'react-router-dom'
import { useCliente, usePedidosDoCliente } from '@/features/clientes/hooks/useClientes'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageContainer, PageHeader } from '@/shared/components/PageHeader'
import { QueryBoundary } from '@/shared/components/QueryBoundary'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { formatDataHora } from '@/shared/lib/format'
import { linkTelefone, linkWhatsapp } from '@/shared/lib/contato'
import { formatBRL, numeroPedido } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function ClienteDetalhePage() {
  const { id = '' } = useParams()
  const cliente = useCliente(id)
  const pedidos = usePedidosDoCliente(id)
  const dados = cliente.data
  const total = (pedidos.data ?? []).reduce((soma, pedido) => soma + pedido.valor_total, 0)

  return (
    <PageContainer>
      <PageHeader
        title={dados?.nome ?? 'Cliente'}
        description={dados ? `${dados.telefone} · ${dados.endereco}` : undefined}
        action={
          <Button asChild>
            <Link to="/pedidos/novo">Novo pedido</Link>
          </Button>
        }
      />
      <QueryBoundary isLoading={cliente.isLoading} error={cliente.error} onRetry={() => void cliente.refetch()}>
        {dados ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <p className="break-words">
                  <span className="text-muted-foreground">Telefone: </span>
                  {dados.telefone}
                </p>
                <p className="break-words">
                  <span className="text-muted-foreground">E-mail: </span>
                  {dados.email || '—'}
                </p>
                <p className="break-words sm:col-span-2">
                  <span className="text-muted-foreground">Endereço: </span>
                  {dados.endereco}
                </p>
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <Button asChild variant="outline">
                    <a href={linkTelefone(dados.telefone)}>Ligar</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={linkWhatsapp(dados.telefone)} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Pedidos</p>
                <p className="text-2xl font-semibold tabular-nums">{pedidos.data?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Valor somado</p>
                <p className="text-2xl font-semibold tabular-nums">{formatBRL(total)}</p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </QueryBoundary>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Pedidos deste cliente</h2>
        <QueryBoundary isLoading={pedidos.isLoading} error={pedidos.error} onRetry={() => void pedidos.refetch()}>
          {pedidos.data && pedidos.data.length > 0 ? (
            <>
              <ul className="space-y-3 md:hidden">
                {pedidos.data.map((pedido) => (
                  <li key={pedido.id} className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-foreground/10">
                    <Link className="font-medium" to={`/pedidos/${pedido.id}`}>
                      {numeroPedido(pedido.numero)}
                    </Link>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <StatusBadge status={pedido.status} />
                      <span className="tabular-nums">{formatBRL(pedido.valor_total)}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{formatDataHora(pedido.created_at)}</p>
                  </li>
                ))}
              </ul>
              <div className="hidden overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-foreground/10 md:block">
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
                        <TableCell>
                          <StatusBadge status={pedido.status} />
                        </TableCell>
                        <TableCell className="tabular-nums">{formatBRL(pedido.valor_total)}</TableCell>
                        <TableCell>{formatDataHora(pedido.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <EmptyState title="Este cliente ainda não tem pedidos" />
          )}
        </QueryBoundary>
      </section>
    </PageContainer>
  )
}
