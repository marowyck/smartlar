import { STATUS_LABEL } from '@/features/pedidos/domain/status'
import type { PedidoDetalhe } from '@/features/pedidos/types'
import { formatDataHora } from '@/utils/format'

export function PedidoHistorico({ pedido }: { pedido: PedidoDetalhe }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Histórico de status</p>
      {pedido.historico_status.map((evento) => (
        <div key={evento.id} className="border-l-2 border-primary/40 pl-3">
          <p className="text-sm">
            {evento.status_anterior
              ? `${STATUS_LABEL[evento.status_anterior]} → ${STATUS_LABEL[evento.status_novo]}`
              : `Criado como ${STATUS_LABEL[evento.status_novo]}`}
          </p>
          <p className="text-xs text-muted-foreground">{formatDataHora(evento.alterado_em)}</p>
        </div>
      ))}
    </div>
  )
}
