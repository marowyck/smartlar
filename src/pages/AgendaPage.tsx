import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState, PageHeader, QueryState } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { atualizarPedido, listarAgenda, listarTecnicos } from '@/lib/api'
import { mensagemErro } from '@/lib/errors'
import { diaLocal, formatDataHora, formatDataLonga, chaveDia } from '@/lib/format'
import { numeroPedido } from '@/lib/money'
import type { PedidoResumo } from '@/lib/types'

export function AgendaPage() {
  const queryClient = useQueryClient()
  const tecnicos = useQuery({ queryKey: ['tecnicos'], queryFn: listarTecnicos })
  const [tecnicoId, setTecnicoId] = useState('')
  const [dia, setDia] = useState<Date | undefined>()
  const tecnicoSelecionado = tecnicoId || tecnicos.data?.[0]?.id || ''

  const agenda = useQuery({
    queryKey: ['agenda', tecnicoSelecionado],
    queryFn: () => listarAgenda(tecnicoSelecionado),
    enabled: Boolean(tecnicoSelecionado),
  })

  const atualizar = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'em_andamento' | 'concluido' }) =>
      atualizarPedido(id, { status }),
    onSuccess: async () => {
      toast.success('Status atualizado')
      await queryClient.invalidateQueries({ queryKey: ['agenda'] })
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => toast.error(mensagemErro(error)),
  })

  const instalacoes = agenda.data ?? []
  const filtradas = instalacoes.filter((item) => {
    if (!dia || !item.data_instalacao) return true
    return diaLocal(item.data_instalacao) === chaveDia(dia)
  })
  const grupos = useMemo(() => agrupar(filtradas), [filtradas])
  const diasComServico = instalacoes
    .map((item) => (item.data_instalacao ? new Date(item.data_instalacao) : null))
    .filter((data): data is Date => data != null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda dos técnicos"
        description="Lucas e Pedro veem as instalações deles e avançam o status daqui."
      />

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-3">
          <Select
            value={tecnicoSelecionado || undefined}
            onValueChange={(value) => {
              setTecnicoId(value)
              setDia(undefined)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={tecnicos.isLoading ? 'Carregando...' : 'Selecione o técnico'} />
            </SelectTrigger>
            <SelectContent>
              {(tecnicos.data ?? []).map((tecnico) => (
                <SelectItem key={tecnico.id} value={tecnico.id}>
                  {tecnico.nome} — {tecnico.especialidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Card>
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

        <QueryState isLoading={agenda.isLoading || tecnicos.isLoading} error={agenda.error ?? tecnicos.error}>
          {grupos.length > 0 ? (
            <div className="space-y-4">
              {grupos.map((grupo) => (
                <Card key={grupo.chave}>
                  <CardHeader>
                    <CardTitle className="capitalize">{grupo.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {grupo.itens.map((item) => (
                      <div key={item.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link className="font-medium underline-offset-4 hover:underline" to={`/pedidos/${item.id}`}>
                              {numeroPedido(item.numero)} · {item.cliente_nome}
                            </Link>
                            <StatusBadge status={item.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">{formatDataHora(item.data_instalacao)}</p>
                          <p className="text-sm">{item.cliente_endereco}</p>
                        </div>
                        <div className="flex gap-2">
                          {item.status === 'agendado' ? (
                            <Button
                              disabled={atualizar.isPending}
                              onClick={() => atualizar.mutate({ id: item.id, status: 'em_andamento' })}
                            >
                              Em andamento
                            </Button>
                          ) : null}
                          {item.status === 'em_andamento' ? (
                            <Button
                              disabled={atualizar.isPending}
                              onClick={() => atualizar.mutate({ id: item.id, status: 'concluido' })}
                            >
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
            <EmptyState>Nenhuma instalação agendada para este técnico.</EmptyState>
          )}
        </QueryState>
      </div>
    </div>
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
