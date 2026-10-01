import { Pencil } from 'lucide-react'
import { STATUS_ACAO, TRANSICOES } from '@/features/pedidos/domain/status'
import type { PedidoDetalhe } from '@/features/pedidos/types'
import { Button } from '@/components/ui/button'

export function PedidoAcoes({
  pedido,
  editando,
  pendente,
  onEditar,
  onVisualizar,
  onAvancar,
  onCancelar,
}: {
  pedido: PedidoDetalhe
  editando: boolean
  pendente: boolean
  onEditar: () => void
  onVisualizar: () => void
  onAvancar: () => void
  onCancelar: () => void
}) {
  const proximos = TRANSICOES[pedido.status]
  const avancar = proximos.find((status) => status !== 'cancelado')
  const podeCancelar = proximos.includes('cancelado')

  if (!editando) {
    return (
      <div className="flex justify-end">
        <Button type="button" size="icon" aria-label="Editar" onClick={onEditar}>
          <Pencil />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={onVisualizar}>
        Visualizar
      </Button>
      {avancar ? (
        <Button onClick={onAvancar} disabled={pendente}>
          {STATUS_ACAO[avancar]}
        </Button>
      ) : null}
      {podeCancelar ? (
        <Button variant="destructive" onClick={onCancelar} disabled={pendente}>
          Cancelar pedido
        </Button>
      ) : null}
    </div>
  )
}
