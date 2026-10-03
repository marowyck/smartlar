import { addDays } from 'date-fns'
import { AgendaDia } from '@/features/agenda/components/AgendaDia'
import { agruparPorDia } from '@/features/agenda/utils/agruparPorDia'
import type { Tecnico } from '@/features/agenda/types'
import type { PedidoResumo } from '@/features/pedidos/types'
import { EmptyState } from '@/components/common/EmptyState'

export function AgendaSemana({
  inicio,
  tecnicos,
  itens,
  pendente,
  onAbrir,
  onMudarStatus,
}: {
  inicio: Date
  tecnicos: Tecnico[]
  itens: PedidoResumo[]
  pendente: boolean
  onAbrir: (id: string) => void
  onMudarStatus: (id: string, status: 'em_andamento' | 'concluido') => void
}) {
  const fim = addDays(inicio, 7)
  const daSemana = itens.filter((item) => {
    if (!item.data_instalacao) return false
    const data = new Date(item.data_instalacao)
    return data >= inicio && data < fim
  })

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {tecnicos.map((tecnico) => {
        const grupos = agruparPorDia(daSemana.filter((item) => item.tecnico_id === tecnico.id))
        return (
          <section key={tecnico.id} className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">{tecnico.nome}</h2>
              <p className="text-sm text-muted-foreground">{tecnico.especialidade}</p>
            </div>
            {grupos.length > 0 ? (
              grupos.map((grupo) => (
                <AgendaDia
                  key={grupo.chave}
                  titulo={grupo.titulo}
                  itens={grupo.itens}
                  pendente={pendente}
                  onAbrir={onAbrir}
                  onMudarStatus={onMudarStatus}
                />
              ))
            ) : (
              <EmptyState title={`${tecnico.nome} está livre nesta semana`} />
            )}
          </section>
        )
      })}
    </div>
  )
}
