import { useState } from 'react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { ComparacaoTecnicos } from '@/features/relatorios/components/ComparacaoTecnicos'
import { GraficoFaturamento } from '@/features/relatorios/components/GraficoFaturamento'
import { GraficoStatus } from '@/features/relatorios/components/GraficoStatus'
import { RankingProdutos } from '@/features/relatorios/components/RankingProdutos'
import { useConversao, useDesempenho, useFaturamentoMensal, usePedidosPorStatus, useProdutosVendidos } from '@/features/relatorios/hooks/useRelatorios'
import { baixarPedidosCsv } from '@/features/relatorios/utils/exportarCsv'
import { mensagemErro } from '@/utils/errors'
import { formatBRL } from '@/utils/money'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RelatoriosPage() {
  const faturamento = useFaturamentoMensal()
  const status = usePedidosPorStatus()
  const produtos = useProdutosVendidos()
  const equipe = useDesempenho()
  const conversao = useConversao()
  const [exportando, setExportando] = useState(false)
  const resumo = conversao.data

  async function exportar() {
    setExportando(true)
    try {
      await baixarPedidosCsv()
    } catch (error) {
      toast.error(mensagemErro(error))
    } finally {
      setExportando(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Relatórios"
        description="Faturamento, conversão de orçamento e o que cada técnico entregou."
        action={
          <Button type="button" variant="outline" disabled={exportando} onClick={() => void exportar()}>
            {exportando ? 'Exportando...' : 'Exportar CSV'}
          </Button>
        }
      />
      <QueryBoundary isLoading={conversao.isLoading} error={conversao.error} onRetry={() => void conversao.refetch()}>
        {resumo ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader><CardTitle className="text-muted-foreground">Ticket médio</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{formatBRL(resumo.ticket_medio)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Só pedidos concluídos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-muted-foreground">Conversão</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{resumo.taxa_percentual}%</p>
                <p className="mt-1 text-xs text-muted-foreground">{resumo.convertidos} de {resumo.total_pedidos} saíram de orçamento</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-muted-foreground">Descontos dados</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{formatBRL(resumo.total_descontado)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Soma dos descontos aplicados</p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </QueryBoundary>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento dos últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryBoundary isLoading={faturamento.isLoading} error={faturamento.error} onRetry={() => void faturamento.refetch()}>
              <GraficoFaturamento dados={faturamento.data ?? []} />
            </QueryBoundary>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por status</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryBoundary isLoading={status.isLoading} error={status.error} onRetry={() => void status.refetch()}>
              <GraficoStatus dados={status.data ?? []} />
            </QueryBoundary>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Produtos por receita</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryBoundary isLoading={produtos.isLoading} error={produtos.error} onRetry={() => void produtos.refetch()}>
              <RankingProdutos produtos={produtos.data ?? []} />
            </QueryBoundary>
          </CardContent>
        </Card>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Lucas e Pedro</h2>
          <QueryBoundary isLoading={equipe.isLoading} error={equipe.error} onRetry={() => void equipe.refetch()}>
            <ComparacaoTecnicos tecnicos={equipe.data ?? []} />
          </QueryBoundary>
        </div>
      </div>
    </PageContainer>
  )
}
