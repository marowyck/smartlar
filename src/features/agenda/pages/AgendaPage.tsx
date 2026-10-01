import { useMemo, useState } from 'react'
import { usePainel } from '@/store/painel-context'
import { toast } from 'sonner'
import { useAgenda, useAtualizarAgenda } from '@/features/agenda/hooks/useAgenda'
import { useTecnicos } from '@/features/agenda/hooks/useTecnicos'
import { EmptyState } from '@/components/common/EmptyState'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { StatusBadge } from '@/features/pedidos/components/StatusBadge'
import { cn } from '@/utils/cn'
import { mensagemErro } from '@/utils/errors'
import { chaveDia, diaLocal, formatDataHora, formatDataLonga } from '@/utils/format'
import { numeroPedido } from '@/utils/money'
import type { PedidoResumo } from '@/features/pedidos/types'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  const grupos = useMemo(() => agrupar(filtradas), [filtradas])
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
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Técnico">
        {(tecnicos.data ?? []).map((tecnico) => (
          <button
            key={tecnico.id}
            type="button"
            role="tab"
            aria-selected={tecnico.id === tecnicoSelecionado}
            onClick={() => {
              setTecnicoId(tecnico.id)
              setDia(undefined)
            }}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm',
              tecnico.id === tecnicoSelecionado ? 'border-primary bg-primary text-primary-foreground' : 'bg-card',
            )}
          >
            {tecnico.nome}
            <span className="ml-2 hidden text-xs opacity-80 sm:inline">{tecnico.especialidade}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-3">
          <Button className="xl:hidden" variant="outline" onClick={() => setCalendarioAberto((aberto) => !aberto)}>
            {calendarioAberto ? 'Ocultar calendário' : 'Mostrar calendário'}
          </Button>
          <Card className={cn(!calendarioAberto && 'hidden xl:block')}>
            <CardContent className="pt-4">
              <Calendar
                mode="single"
                selected={dia}
                onSelect={setDia}
                modifiers={{ ocupado: diasComServico }}
                modifiersClassNames={{ ocupado: 'font-semibold text-primary' }}
              />
              {dia ? (
                <Button variant="ghost" className="mt-2 w-full" onClick={() => setDia(undefined)}>
                  Ver todos os dias
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
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
                <Card key={grupo.chave}>
                  <CardHeader>
                    <CardTitle className="capitalize">{grupo.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {grupo.itens.map((item) => (
                      <div key={item.id} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button type="button" className="font-medium underline-offset-4 hover:underline" onClick={() => abrirPedido(item.id, 'ver')}>
                              {numeroPedido(item.numero)} · {item.cliente_nome}
                            </button>
                            <StatusBadge status={item.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">{formatDataHora(item.data_instalacao)}</p>
                          <p className="break-words text-sm">{item.cliente_endereco}</p>
                        </div>
                        <div className="flex gap-2">
                          {item.status === 'agendado' ? (
                            <Button disabled={atualizar.isPending} onClick={() => mudarStatus(item.id, 'em_andamento')}>
                              Iniciar
                            </Button>
                          ) : null}
                          {item.status === 'em_andamento' ? (
                            <Button disabled={atualizar.isPending} onClick={() => mudarStatus(item.id, 'concluido')}>
                              Concluir
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
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

function agrupar(itens: PedidoResumo[]) {
  const mapa = new Map<string, PedidoResumo[]>()
  for (const item of itens) {
    const chave = item.data_instalacao ? diaLocal(item.data_instalacao) : 'sem-data'
    const lista = mapa.get(chave) ?? []
    lista.push(item)
    mapa.set(chave, lista)
  }
  return [...mapa.entries()].map(([chave, lista]) => ({
    chave,
    titulo: lista[0]?.data_instalacao ? formatDataLonga(lista[0].data_instalacao) : 'Sem data',
    itens: lista,
  }))
}
