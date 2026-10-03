import { Link } from 'react-router-dom'
import type { PedidoDetalhe } from '@/features/pedidos/types'
import { textoOrcamentoWhatsapp } from '@/features/pedidos/domain/orcamento'
import { routes } from '@/constants/routes'
import { linkWhatsapp } from '@/utils/contato'
import { formatDataHora } from '@/utils/format'
import { FORMAS_PAGAMENTO, labelFormaPagamento, type FormaPagamento } from '@/utils/money'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function PedidoResumo({
  pedido,
  editando,
  observacoes,
  salvando,
  onObservacoes,
  onSalvarObservacoes,
  onFormaPagamento,
  onAbrirCliente,
}: {
  pedido: PedidoDetalhe
  editando: boolean
  observacoes: string
  salvando: boolean
  onObservacoes: (valor: string) => void
  onSalvarObservacoes: () => void
  onFormaPagamento: (valor: FormaPagamento) => void
  onAbrirCliente: (id: string) => void
}) {
  const encerrado = pedido.status === 'concluido' || pedido.status === 'cancelado'

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1 text-sm">
        <p className="font-medium">Cliente</p>
        {pedido.clientes ? (
          <>
            <button type="button" className="font-medium text-primary underline-offset-4 hover:underline" onClick={() => onAbrirCliente(pedido.clientes!.id)}>
              {pedido.clientes.nome}
            </button>
            <p>{pedido.clientes.telefone}</p>
            <p>{pedido.clientes.email || 'Sem e-mail'}</p>
            <p className="break-words text-muted-foreground">{pedido.clientes.endereco}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" asChild>
                <a
                  href={linkWhatsapp(
                    pedido.clientes.telefone,
                    textoOrcamentoWhatsapp({
                      numero: pedido.numero,
                      clienteNome: pedido.clientes.nome,
                      itens: pedido.itens_pedido.map((item) => ({
                        quantidade: item.quantidade,
                        nome: item.produtos?.nome ?? 'Produto',
                        subtotal: item.subtotal,
                      })),
                      desconto: pedido.desconto,
                      valorTotal: pedido.valor_total,
                    }),
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Enviar por WhatsApp
                </a>
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to={routes.orcamento(pedido.id)} target="_blank">
                  Imprimir orçamento
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <p>Cliente não encontrado</p>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <p className="font-medium">Instalação</p>
        <p>
          <span className="text-muted-foreground">Técnico: </span>
          {pedido.tecnicos?.nome ?? 'Não definido'}
        </p>
        <p>
          <span className="text-muted-foreground">Data: </span>
          {formatDataHora(pedido.data_instalacao)}
        </p>
        {editando && !encerrado ? (
          <div className="grid gap-1.5">
            <Label htmlFor="pedido-observacoes">Observações</Label>
            <Textarea id="pedido-observacoes" value={observacoes} onChange={(event) => onObservacoes(event.target.value)} />
            <Button
              type="button"
              variant="outline"
              disabled={salvando || observacoes === (pedido.observacoes ?? '')}
              onClick={onSalvarObservacoes}
            >
              Salvar observações
            </Button>
          </div>
        ) : (
          <p className="break-words">
            <span className="text-muted-foreground">Observações: </span>
            {pedido.observacoes || '—'}
          </p>
        )}
        {editando ? (
          <div className="grid gap-1.5">
            <Label>Forma de pagamento</Label>
            <Select
              value={pedido.forma_pagamento ?? 'nenhuma'}
              disabled={encerrado || salvando}
              onValueChange={(value) => {
                if (value === 'nenhuma' || value === pedido.forma_pagamento) return
                onFormaPagamento(value as FormaPagamento)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Não informada</SelectItem>
                {FORMAS_PAGAMENTO.map((forma) => (
                  <SelectItem key={forma.value} value={forma.value}>
                    {forma.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <p>
            <span className="text-muted-foreground">Pagamento: </span>
            {labelFormaPagamento(pedido.forma_pagamento)}
          </p>
        )}
      </div>
    </div>
  )
}
