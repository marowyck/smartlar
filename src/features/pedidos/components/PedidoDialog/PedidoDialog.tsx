import { AgendarDialog } from '@/features/pedidos/components/AgendarDialog'
import { CancelarDialog } from '@/features/pedidos/components/CancelarDialog'
import { ConcluirDialog } from '@/features/pedidos/components/ConcluirDialog'
import { PedidoAcoes } from '@/features/pedidos/components/PedidoAcoes'
import { PedidoHistorico } from '@/features/pedidos/components/PedidoHistorico'
import { PedidoItensEditor } from '@/features/pedidos/components/PedidoItensEditor'
import { PedidoItensTable } from '@/features/pedidos/components/PedidoItensTable'
import { PedidoResumo } from '@/features/pedidos/components/PedidoResumo'
import { StatusBadge } from '@/features/pedidos/components/StatusBadge'
import { StatusTimeline } from '@/features/pedidos/components/StatusTimeline'
import { TRANSICOES, exigeAgendamento } from '@/features/pedidos/domain/status'
import { usePedidoDialog } from '@/features/pedidos/hooks/usePedidoDialog'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { numeroPedido } from '@/utils/money'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PedidoDialogProps } from './PedidoDialog.types'

export function PedidoDialog({ id, modo, aberto, onOpenChange, onModo, onAbrirCliente }: PedidoDialogProps) {
  const dialog = usePedidoDialog(id, aberto)
  const { dados } = dialog
  const editando = modo === 'editar'
  const avancar = dados ? TRANSICOES[dados.status].find((status) => status !== 'cancelado') : undefined
  const textoObservacoes = dialog.observacoes ?? dados?.observacoes ?? ''

  function seguir() {
    if (!dados || !avancar) return
    if (exigeAgendamento(avancar)) {
      dialog.pedirAgendamento()
      return
    }
    if (avancar === 'concluido' && !dados.forma_pagamento) {
      dialog.setConcluirAberto(true)
      return
    }
    dialog.salvar({ status: avancar })
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,860px)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{dados ? `Pedido ${numeroPedido(dados.numero)}` : 'Pedido'}</DialogTitle>
          <DialogDescription>
            {editando && dados?.status === 'orcamento'
              ? 'Enquanto é orçamento, os itens podem mudar. O status só anda para a frente.'
              : editando
                ? 'O status só anda para a frente. Cancelar só sai de orçamento ou aprovado.'
                : 'Consulta do pedido, dos itens e do histórico.'}
          </DialogDescription>
        </DialogHeader>
        <QueryBoundary isLoading={dialog.pedido.isLoading} error={dialog.pedido.error} onRetry={() => void dialog.pedido.refetch()}>
          {dados ? (
            <div className="space-y-4">
              {editando ? (
                <PedidoAcoes
                  pedido={dados}
                  editando
                  pendente={dialog.atualizar.isPending}
                  onEditar={() => onModo('editar')}
                  onVisualizar={() => onModo('ver')}
                  onAvancar={seguir}
                  onCancelar={() => dialog.setCancelarAberto(true)}
                />
              ) : null}
              <StatusBadge status={dados.status} />
              <StatusTimeline status={dados.status} />
              {editando && dados.status === 'orcamento' ? (
                <PedidoItensEditor
                  key={dados.itens_pedido
                    .map((item) => `${item.id}:${item.produto_id}:${item.quantidade}:${item.preco_unitario}`)
                    .join('|')}
                  pedido={dados}
                />
              ) : (
                <PedidoItensTable pedido={dados} />
              )}
              <PedidoResumo
                pedido={dados}
                editando={editando}
                observacoes={textoObservacoes}
                salvando={dialog.atualizar.isPending}
                onObservacoes={dialog.setObservacoes}
                onSalvarObservacoes={() => dialog.salvar({ observacoes: textoObservacoes.trim() || null })}
                onFormaPagamento={(valor) => dialog.salvar({ forma_pagamento: valor })}
                onAbrirCliente={onAbrirCliente}
              />
              <PedidoHistorico pedido={dados} />
              {editando ? null : (
                <PedidoAcoes
                  pedido={dados}
                  editando={false}
                  pendente={dialog.atualizar.isPending}
                  onEditar={() => onModo('editar')}
                  onVisualizar={() => onModo('ver')}
                  onAvancar={seguir}
                  onCancelar={() => dialog.setCancelarAberto(true)}
                />
              )}
            </div>
          ) : null}
        </QueryBoundary>
      </DialogContent>
      <AgendarDialog
        aberto={dialog.agendarAberto}
        tecnicoId={dialog.tecnicoId}
        dataLocal={dialog.dataLocal}
        pendente={dialog.atualizar.isPending}
        onOpenChange={dialog.setAgendarAberto}
        onTecnico={dialog.setTecnicoId}
        onData={dialog.setDataLocal}
        onConfirmar={dialog.confirmarAgenda}
      />
      <ConcluirDialog
        aberto={dialog.concluirAberto}
        pagamento={dialog.pagamento}
        pendente={dialog.atualizar.isPending}
        onOpenChange={dialog.setConcluirAberto}
        onPagamento={dialog.setPagamento}
        onConfirmar={() => dialog.salvar({ status: 'concluido', forma_pagamento: dialog.pagamento })}
      />
      <CancelarDialog
        aberto={dialog.cancelarAberto}
        onOpenChange={dialog.setCancelarAberto}
        onConfirmar={() => dialog.salvar({ status: 'cancelado' })}
      />
    </Dialog>
  )
}
