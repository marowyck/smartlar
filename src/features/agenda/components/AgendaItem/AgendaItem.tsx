import { StatusBadge } from '@/features/pedidos/components/StatusBadge'
import type { PedidoResumo } from '@/features/pedidos/types'
import { formatDataHora } from '@/utils/format'
import { numeroPedido } from '@/utils/money'
import { Button } from '@/components/ui/button'

export function AgendaItem({
  item,
  pendente,
  onAbrir,
  onMudarStatus,
}: {
  item: PedidoResumo
  pendente: boolean
  onAbrir: (id: string) => void
  onMudarStatus: (id: string, status: 'em_andamento' | 'concluido') => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="font-medium underline-offset-4 hover:underline" onClick={() => onAbrir(item.id)}>
            {numeroPedido(item.numero)} · {item.cliente_nome}
          </button>
          <StatusBadge status={item.status} />
        </div>
        <p className="text-sm text-muted-foreground">{formatDataHora(item.data_instalacao)}</p>
        <p className="break-words text-sm">{item.cliente_endereco}</p>
      </div>
      <div className="flex gap-2">
        {item.status === 'agendado' ? (
          <Button disabled={pendente} onClick={() => onMudarStatus(item.id, 'em_andamento')}>
            Iniciar
          </Button>
        ) : null}
        {item.status === 'em_andamento' ? (
          <Button disabled={pendente} onClick={() => onMudarStatus(item.id, 'concluido')}>
            Concluir
          </Button>
        ) : null}
      </div>
    </div>
  )
}
