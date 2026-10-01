import { NovoPedidoPassos } from '@/features/pedidos/components/NovoPedidoPassos'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function NovoPedidoDialog({
  aberto,
  clienteInicial,
  onOpenChange,
}: {
  aberto: boolean
  clienteInicial?: string
  onOpenChange: (aberto: boolean) => void
}) {
  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,820px)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo pedido</DialogTitle>
          <DialogDescription>O pedido nasce como orçamento. O total é a soma dos itens.</DialogDescription>
        </DialogHeader>
        {aberto ? (
          <NovoPedidoPassos clienteInicial={clienteInicial} onCriado={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
