import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { AgendaDia } from '@/features/agenda/components/AgendaDia'
import { AgendaCalendario, AgendaFiltros } from '@/features/agenda/components/AgendaFiltros'
import { useAgenda, useAtualizarAgenda } from '@/features/agenda/hooks/useAgenda'
import { useTecnicos } from '@/features/agenda/hooks/useTecnicos'
import { agruparPorDia } from '@/features/agenda/utils/agruparPorDia'
import { usePainel } from '@/store/painel-context'
import { mensagemErro } from '@/utils/errors'
import { chaveDia, diaLocal } from '@/utils/format'

export function AgendaPage() {
  const { abrirPedido } = usePainel()
  const tecnicos = useTecnicos()
  const [tecnicoId, setTecnicoId] = useState('')
  const [dia, setDia] = useState<Date | undefined>()
  const [calendarioAberto, setCalendarioAberto] = useState(false)
  const tecnicoSelecionado = tecnicoId || tecnicos.data?.[0]?.id || ''
  const agenda = useAgenda(tecnicoSelecionado)
  const atualizar = useAtualizarAgenda()
  const instalacoes = agenda.data ?? []
  const filtradas = instalacoes.filter((item) => {
    if (!dia || !item.data_instalacao) return true
    return diaLocal(item.data_instalacao) === chaveDia(dia)
  })
  const grupos = useMemo(() => agruparPorDia(filtradas), [filtradas])
  const diasComServico = instalacoes
    .map((item) => (item.data_instalacao ? new Date(item.data_instalacao) : null))
    .filter((data): data is Date => data != null)

  function mudarStatus(id: string, status: 'em_andamento' | 'concluido') {
    atualizar.mutate(
      { id, status },
      {
        onSuccess: () => toast.success('Status atualizado'),
        onError: (error) => toast.error(mensagemErro(error)),
      },
    )
  }

  return (
    <PageContainer>
      <PageHeader title="Agenda dos técnicos" description="Lucas e Pedro veem as instalações deles e avançam o status daqui." />
      <AgendaFiltros
        tecnicos={tecnicos.data ?? []}
        tecnicoSelecionado={tecnicoSelecionado}
        onTecnico={(id) => {
          setTecnicoId(id)
          setDia(undefined)
        }}
      />
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <AgendaCalendario
          dia={dia}
          diasComServico={diasComServico}
          calendarioAberto={calendarioAberto}
          onDia={setDia}
          onCalendario={() => setCalendarioAberto((aberto) => !aberto)}
        />
        <QueryBoundary
          isLoading={agenda.isLoading || tecnicos.isLoading}
          error={agenda.error ?? tecnicos.error}
          onRetry={() => {
            void agenda.refetch()
            void tecnicos.refetch()
          }}
        >
          {grupos.length > 0 ? (
            <div className="space-y-4">
              {grupos.map((grupo) => (
                <AgendaDia
                  key={grupo.chave}
                  titulo={grupo.titulo}
                  itens={grupo.itens}
                  pendente={atualizar.isPending}
                  onAbrir={(id) => abrirPedido(id, 'ver')}
                  onMudarStatus={mudarStatus}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Nenhuma instalação agendada para este técnico" />
          )}
        </QueryBoundary>
      </div>
    </PageContainer>
  )
}
