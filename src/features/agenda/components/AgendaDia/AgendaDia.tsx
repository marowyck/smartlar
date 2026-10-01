import { AgendaItem } from '@/features/agenda/components/AgendaItem'
import type { PedidoResumo } from '@/features/pedidos/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AgendaDia({
  titulo,
  itens,
  pendente,
  onAbrir,
  onMudarStatus,
}: {
  titulo: string
  itens: PedidoResumo[]
  pendente: boolean
  onAbrir: (id: string) => void
  onMudarStatus: (id: string, status: 'em_andamento' | 'concluido') => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {itens.map((item) => (
          <AgendaItem key={item.id} item={item} pendente={pendente} onAbrir={onAbrir} onMudarStatus={onMudarStatus} />
        ))}
      </CardContent>
    </Card>
  )
}
