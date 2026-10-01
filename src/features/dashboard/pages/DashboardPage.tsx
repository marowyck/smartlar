import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarClock, CircleDollarSign, ClipboardList, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { usePainel } from '@/store/painel-context'
import { toast } from 'sonner'
import { useKpis, useOrcamentosParados, useProximasInstalacoes } from '@/features/dashboard/hooks/useDashboard'
import type { ProximaInstalacao } from '@/features/dashboard/types'
import { atualizarPedido } from '@/features/pedidos/services/pedidos'
import { EmptyState } from '@/components/common/EmptyState'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { StatusBadge } from '@/features/pedidos/components/StatusBadge'
import { mensagemErro } from '@/utils/errors'
import { diaLocal, formatDataHora, formatDataLonga } from '@/utils/format'
import { formatBRL, numeroPedido } from '@/utils/money'
import { useInvalidateOperacao } from '@/hooks/useInvalidateOperacao'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  const { abrirPedido } = usePainel()
  const kpis = useKpis()
  const proximas = useProximasInstalacoes()
  const orcamentos = useOrcamentosParados()
  const invalidar = useInvalidateOperacao()
  const aprovar = useMutation({
    mutationFn: (id: string) => atualizarPedido(id, { status: 'aprovado' }),
    onSuccess: async () => {
      toast.success('Orçamento aprovado')
      await invalidar()
    },
    onError: (error) => toast.error(mensagemErro(error)),
  })
  const indicadores = kpis.data
  const [saudacao] = useState(() => format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR }))
  const grupos = agrupar(proximas.data ?? [])

  return (
    <PageContainer>
      <PageHeader title="Olá, Rafael" description={`Hoje é ${saudacao}. Veja o que entrou, o que já foi faturado e o que ainda precisa de agenda.`} />
      <QueryBoundary isLoading={kpis.isLoading} error={kpis.error} onRetry={() => void kpis.refetch()}>
        {indicadores ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard titulo="Pedidos do mês" valor={String(indicadores.pedidos_mes)} detalhe="Criados neste mês" to="/pedidos" icon={<ClipboardList className="size-4" />} />
            <KpiCard titulo="Faturado no mês" valor={formatBRL(indicadores.valor_faturado)} detalhe="Pedidos concluídos" to="/pedidos?status=concluido" icon={<CircleDollarSign className="size-4" />} destaque />
            <KpiCard titulo="A receber" valor={formatBRL(indicadores.valor_a_receber)} detalhe="Aprovados, agendados e em andamento" to="/pedidos" icon={<Wallet className="size-4" />} />
            <KpiCard titulo="Pendentes de agenda" valor={String(indicadores.pendentes_agendamento)} detalhe="Aprovados sem técnico e data" to="/pedidos?status=aprovado" icon={<CalendarClock className="size-4" />} />
          </div>
        ) : null}
      </QueryBoundary>
      <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        <section className="space-y-3 2xl:col-span-2">
          <h2 className="text-lg font-semibold">Próximas instalações</h2>
          <p className="text-sm text-muted-foreground">Agendadas e em andamento nos próximos 7 dias.</p>
          <QueryBoundary isLoading={proximas.isLoading} error={proximas.error} onRetry={() => void proximas.refetch()}>
            {grupos.length > 0 ? (
              <div className="space-y-4">
                {grupos.map((grupo) => (
                  <Card key={grupo.chave}>
                    <CardHeader>
                      <CardTitle className="capitalize">{grupo.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {grupo.itens.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="flex w-full flex-col gap-1 rounded-xl border p-3 text-left hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                          onClick={() => abrirPedido(item.id, 'ver')}
                        >
                          <span>
                            <span className="block font-medium">{item.cliente_nome}</span>
                            <span className="block text-sm text-muted-foreground">{formatDataHora(item.data_instalacao)}</span>
                            <span className="block break-words text-sm">{item.endereco}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <StatusBadge status={item.status} />
                            <span className="text-sm text-muted-foreground">{item.tecnico_nome ?? '—'}</span>
                          </span>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState title="Nenhuma instalação nos próximos 7 dias" />
            )}
          </QueryBoundary>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Orçamentos aguardando aprovação</h2>
          <QueryBoundary isLoading={orcamentos.isLoading} error={orcamentos.error} onRetry={() => void orcamentos.refetch()}>
            {orcamentos.data && orcamentos.data.length > 0 ? (
              <div className="space-y-3">
                {orcamentos.data.map((pedido) => (
                  <Card key={pedido.id}>
                    <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button type="button" className="text-left" onClick={() => abrirPedido(pedido.id, 'ver')}>
                        <p className="font-medium">
                          {numeroPedido(pedido.numero)} · {pedido.cliente_nome}
                        </p>
                        <p className="text-sm text-muted-foreground">{pedido.cliente_telefone}</p>
                        <p className="mt-1 font-semibold tabular-nums">{formatBRL(pedido.valor_total)}</p>
                      </button>
                      <Button disabled={aprovar.isPending} onClick={() => aprovar.mutate(pedido.id)}>
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
      </div>
    </PageContainer>
  )
}

function KpiCard({
  titulo,
  valor,
  detalhe,
  to,
  icon,
  destaque = false,
}: {
  titulo: string
  valor: string
  detalhe: string
  to: string
  icon: ReactNode
  destaque?: boolean
}) {
  return (
    <Link to={to} className="block">
      <Card variant="interactive" className={destaque ? 'bg-primary text-primary-foreground ring-primary' : undefined}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className={destaque ? 'text-primary-foreground/80' : 'text-muted-foreground'}>{titulo}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{valor}</p>
          <p className={destaque ? 'mt-1 text-xs text-primary-foreground/80' : 'mt-1 text-xs text-muted-foreground'}>{detalhe}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

function agrupar(itens: ProximaInstalacao[]) {
  const mapa = new Map<string, typeof itens>()
  for (const item of itens) {
    const chave = diaLocal(item.data_instalacao)
    const lista = mapa.get(chave) ?? []
    lista.push(item)
    mapa.set(chave, lista)
  }
  return [...mapa.entries()].map(([chave, lista]) => ({
    chave,
    titulo: formatDataLonga(lista[0]?.data_instalacao),
    itens: lista,
  }))
}
