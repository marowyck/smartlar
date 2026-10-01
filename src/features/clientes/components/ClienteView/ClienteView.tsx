import { CirclePlus, Pencil } from 'lucide-react'
import { ClientePedidosList } from '@/features/clientes/components/ClientePedidosList'
import type { Cliente } from '@/features/clientes/types'
import type { PedidoResumo } from '@/features/pedidos/types'
import { linkTelefone, linkWhatsapp } from '@/utils/phone'
import { formatBRL } from '@/utils/money'
import { Button } from '@/components/ui/button'

export function ClienteView({
  cliente,
  pedidos,
  carregandoPedidos,
  erroPedidos,
  onRetryPedidos,
  onNovoPedido,
  onAbrirPedido,
  onEditar,
}: {
  cliente: Cliente
  pedidos: PedidoResumo[] | undefined
  carregandoPedidos: boolean
  erroPedidos: unknown
  onRetryPedidos: () => void
  onNovoPedido: () => void
  onAbrirPedido: (id: string) => void
  onEditar: () => void
}) {
  const total = (pedidos ?? []).reduce((soma, pedido) => soma + pedido.valor_total, 0)

  return (
    <div className="space-y-4 text-sm">
      <p className="break-words">
        <span className="text-muted-foreground">Telefone: </span>
        {cliente.telefone}
      </p>
      <p className="break-words">
        <span className="text-muted-foreground">E-mail: </span>
        {cliente.email || '—'}
      </p>
      <p className="break-words">
        <span className="text-muted-foreground">Endereço: </span>
        {cliente.endereco}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <a href={linkTelefone(cliente.telefone)}>Ligar</a>
        </Button>
        <Button asChild variant="outline">
          <a href={linkWhatsapp(cliente.telefone)} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </Button>
        <Button type="button" onClick={onNovoPedido}>
          Novo pedido
          <CirclePlus data-icon="inline-end" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <p>
          <span className="block text-muted-foreground">Pedidos</span>
          <span className="text-2xl font-semibold tabular-nums">{pedidos?.length ?? 0}</span>
        </p>
        <p>
          <span className="block text-muted-foreground">Valor somado</span>
          <span className="text-2xl font-semibold tabular-nums">{formatBRL(total)}</span>
        </p>
      </div>
      <ClientePedidosList
        pedidos={pedidos}
        isLoading={carregandoPedidos}
        error={erroPedidos}
        onRetry={onRetryPedidos}
        onAbrirPedido={onAbrirPedido}
      />
      <div className="flex justify-end">
        <Button type="button" size="icon" aria-label="Editar" onClick={onEditar}>
          <Pencil />
        </Button>
      </div>
    </div>
  )
}
