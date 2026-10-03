import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { routes } from '@/constants/routes'
import { useDesempenho } from '@/features/relatorios/hooks/useRelatorios'
import { linkWhatsapp } from '@/utils/contato'
import { formatDataHora } from '@/utils/format'
import { formatBRL } from '@/utils/money'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function EquipePage() {
  const equipe = useDesempenho()

  return (
    <PageContainer>
      <PageHeader title="Equipe" description="Quem instala, o que cada um faturou no mês e a próxima visita." />
      <QueryBoundary isLoading={equipe.isLoading} error={equipe.error} onRetry={() => void equipe.refetch()}>
        <div className="grid gap-4 lg:grid-cols-2">
          {(equipe.data ?? []).map((tecnico) => (
            <Card key={tecnico.id}>
              <CardHeader>
                <CardTitle>{tecnico.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{tecnico.especialidade}</p>
                <p>{tecnico.telefone}</p>
                <div className="grid gap-1">
                  <p>Concluídas no mês: <span className="font-medium">{tecnico.concluidas_mes}</span></p>
                  <p>Faturado no mês: <span className="font-medium tabular-nums">{formatBRL(tecnico.faturado_mes)}</span></p>
                  <p>Instalações nos próximos 7 dias: <span className="font-medium">{tecnico.carga_semana}</span></p>
                  <p>Próxima instalação: <span className="font-medium">{formatDataHora(tecnico.proxima_instalacao)}</span></p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <a href={linkWhatsapp(tecnico.telefone)} target="_blank" rel="noreferrer">WhatsApp</a>
                  </Button>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link to={routes.agenda}>Ver agenda</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </PageContainer>
  )
}
