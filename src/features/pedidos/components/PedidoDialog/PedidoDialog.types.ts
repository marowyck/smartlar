import type { ModoPainel } from '@/store/painel-context'

export type PedidoDialogProps = {
  id: string
  modo: ModoPainel
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  onModo: (modo: ModoPainel) => void
  onAbrirCliente: (id: string) => void
}
