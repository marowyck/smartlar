import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarClock, CircleDollarSign, ClipboardList, Wallet } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { routes } from '@/constants/routes'
import { KpiCard } from '@/features/dashboard/components/KpiCard'
import { GraficoFaturamento } from '@/features/relatorios/components/GraficoFaturamento'
import { useFaturamentoMensal } from '@/features/relatorios/hooks/useRelatorios'
import { OrcamentosParados } from '@/features/dashboard/components/OrcamentosParados'
import { ProximasInstalacoes } from '@/features/dashboard/components/ProximasInstalacoes'
import { useKpis, useOrcamentosParados, useProximasInstalacoes } from '@/features/dashboard/hooks/useDashboard'
import { atualizarPedido } from '@/features/pedidos/services/pedidos'
import { useInvalidateOperacao } from '@/hooks/useInvalidateOperacao'
import { usePainel } from '@/store/painel-context'
import { mensagemErro } from '@/utils/errors'
import { formatBRL } from '@/utils/money'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  const { abrirPedido } = usePainel()
  const kpis = useKpis()
  const proximas = useProximasInstalacoes()
  const orcamentos = useOrcamentosParados()
  const faturamento = useFaturamentoMensal()
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

  return (
    <PageContainer>
      <PageHeader title="Olá, Rafael" description={`Hoje é ${saudacao}. Veja o que entrou, o que já foi faturado e o que ainda precisa de agenda.`} />
      <QueryBoundary isLoading={kpis.isLoading} error={kpis.error} onRetry={() => void kpis.refetch()}>
        {indicadores ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard titulo="Pedidos do mês" valor={String(indicadores.pedidos_mes)} detalhe="Criados neste mês" to={routes.pedidos} icon={<ClipboardList className="size-4" />} />
            <KpiCard titulo="Faturado no mês" valor={formatBRL(indicadores.valor_faturado)} detalhe="Pedidos concluídos" to={routes.pedidosFiltrados('concluido')} icon={<CircleDollarSign className="size-4" />} destaque />
            <KpiCard titulo="A receber" valor={formatBRL(indicadores.valor_a_receber)} detalhe="Aprovados, agendados e em andamento" to={routes.pedidos} icon={<Wallet className="size-4" />} />
            <KpiCard titulo="Pendentes de agenda" valor={String(indicadores.pendentes_agendamento)} detalhe="Aprovados sem técnico e data" to={routes.pedidosFiltrados('aprovado')} icon={<CalendarClock className="size-4" />} />
          </div>
        ) : null}
      </QueryBoundary>
      <Card>
        <CardHeader>
          <CardTitle>Faturamento dos últimos 6 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryBoundary isLoading={faturamento.isLoading} error={faturamento.error} onRetry={() => void faturamento.refetch()}>
            <GraficoFaturamento dados={faturamento.data ?? []} altura={220} />
          </QueryBoundary>
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        <ProximasInstalacoes
          instalacoes={proximas.data ?? []}
          isLoading={proximas.isLoading}
          error={proximas.error}
          onRetry={() => void proximas.refetch()}
          onAbrir={(id) => abrirPedido(id, 'ver')}
        />
        <OrcamentosParados
          pedidos={orcamentos.data ?? []}
          isLoading={orcamentos.isLoading}
          error={orcamentos.error}
          aprovando={aprovar.isPending}
          onRetry={() => void orcamentos.refetch()}
          onAbrir={(id) => abrirPedido(id, 'ver')}
          onAprovar={(id) => aprovar.mutate(id)}
        />
      </div>
    </PageContainer>
  )
}
