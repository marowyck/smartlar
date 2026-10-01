import type { ModoPainel } from '@/store/painel-context'

export type ClienteDialogProps = {
  id: string
  modo: ModoPainel
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  onModo: (modo: ModoPainel) => void
  onAbrirPedido: (id: string) => void
}
