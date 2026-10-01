import { toast } from 'sonner'
import { ClienteView } from '@/features/clientes/components/ClienteView'
import { EditarClienteForm } from '@/features/clientes/components/EditarClienteForm'
import { useCliente, usePedidosDoCliente } from '@/features/clientes/hooks/useClientes'
import { useNovoPedido } from '@/features/pedidos/context/novo-pedido-context'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ClienteDialogProps } from './ClienteDialog.types'

export function ClienteDialog({ id, modo, aberto, onOpenChange, onModo, onAbrirPedido }: ClienteDialogProps) {
  const { abrir } = useNovoPedido()
  const cliente = useCliente(aberto ? id : '')
  const pedidos = usePedidosDoCliente(aberto ? id : '')
  const dados = cliente.data

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,820px)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{modo === 'editar' ? 'Editar cliente' : (dados?.nome ?? 'Cliente')}</DialogTitle>
          <DialogDescription>
            {modo === 'editar' ? 'Atualize contato e endereço da instalação.' : 'Contato, resumo e pedidos deste cliente.'}
          </DialogDescription>
        </DialogHeader>
        {modo === 'editar' ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => onModo('ver')}>
              Visualizar
            </Button>
          </div>
        ) : null}
        <QueryBoundary isLoading={cliente.isLoading} error={cliente.error} onRetry={() => void cliente.refetch()}>
          {dados && modo === 'editar' ? (
            <EditarClienteForm
              id={dados.id}
              valores={{
                nome: dados.nome,
                telefone: dados.telefone,
                email: dados.email ?? '',
                endereco: dados.endereco,
              }}
              onSaved={() => {
                toast.success('Cliente atualizado')
                onModo('ver')
              }}
            />
          ) : null}
          {dados && modo === 'ver' ? (
            <ClienteView
              cliente={dados}
              pedidos={pedidos.data}
              carregandoPedidos={pedidos.isLoading}
              erroPedidos={pedidos.error}
              onRetryPedidos={() => void pedidos.refetch()}
              onNovoPedido={() => abrir(id)}
              onAbrirPedido={onAbrirPedido}
              onEditar={() => onModo('editar')}
            />
          ) : null}
        </QueryBoundary>
      </DialogContent>
    </Dialog>
  )
}
