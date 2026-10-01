import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState, PageHeader, QueryState } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { listarPedidos, listarProximasInstalacoes, obterKpis } from '@/lib/api'
import { formatDataHora } from '@/lib/format'
import { formatBRL, numeroPedido } from '@/lib/money'

export function DashboardPage() {
  const navigate = useNavigate()
  const kpis = useQuery({ queryKey: ['dashboard', 'kpis'], queryFn: obterKpis })
  const proximas = useQuery({ queryKey: ['dashboard', 'proximas'], queryFn: listarProximasInstalacoes })
  const orcamentos = useQuery({
    queryKey: ['pedidos', 'orcamento'],
    queryFn: () => listarPedidos('orcamento'),
  })

  const indicadores = kpis.data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="O que entrou no mês, o que já foi faturado e o que ainda precisa de agenda."
      />

      <QueryState isLoading={kpis.isLoading} error={kpis.error}>
        {indicadores ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Indicador titulo="Pedidos do mês" valor={String(indicadores.pedidos_mes)} detalhe="Criados neste mês" to="/pedidos" />
            <Indicador titulo="Faturado no mês" valor={formatBRL(indicadores.valor_faturado)} detalhe="Pedidos concluídos" to="/pedidos?status=concluido" />
            <Indicador titulo="A receber" valor={formatBRL(indicadores.valor_a_receber)} detalhe="Aprovados, agendados e em andamento" to="/pedidos" />
            <Indicador titulo="Pendentes de agenda" valor={String(indicadores.pendentes_agendamento)} detalhe="Aprovados sem técnico e data" to="/pedidos?status=aprovado" />
          </div>
        ) : null}
      </QueryState>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Próximas instalações</h2>
          <p className="text-sm text-muted-foreground">Agendadas e em andamento nos próximos 7 dias.</p>
          <QueryState isLoading={proximas.isLoading} error={proximas.error}>
            {proximas.data && proximas.data.length > 0 ? (
              <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quando</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Técnico</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proximas.data.map((item) => (
                      <TableRow key={item.id} className="cursor-pointer" onClick={() => navigate(`/pedidos/${item.id}`)}>
                        <TableCell>
                          <div className="font-medium">{formatDataHora(item.data_instalacao)}</div>
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>
                          <div>{item.cliente_nome}</div>
                          <div className="text-xs text-muted-foreground">{item.endereco}</div>
                        </TableCell>
                        <TableCell>{item.tecnico_nome ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState>Nenhuma instalação nos próximos 7 dias.</EmptyState>
            )}
          </QueryState>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Orçamentos aguardando aprovação</h2>
          <QueryState isLoading={orcamentos.isLoading} error={orcamentos.error}>
            {orcamentos.data && orcamentos.data.length > 0 ? (
              <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orcamentos.data.map((pedido) => (
                      <TableRow key={pedido.id} className="cursor-pointer" onClick={() => navigate(`/pedidos/${pedido.id}`)}>
                        <TableCell>{numeroPedido(pedido.numero)}</TableCell>
                        <TableCell>
                          <div>{pedido.cliente_nome}</div>
                          <div className="text-xs text-muted-foreground">{pedido.cliente_telefone}</div>
                        </TableCell>
                        <TableCell>{formatBRL(pedido.valor_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState>Nenhum orçamento parado.</EmptyState>
            )}
          </QueryState>
        </section>
      </div>
    </div>
  )
}

function Indicador({
  titulo,
  valor,
  detalhe,
  to,
}: {
  titulo: string
  valor: string
  detalhe: string
  to: string
}) {
  return (
    <Link to={to} className="block">
      <Card className="h-full transition-colors hover:bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tracking-tight">{valor}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
