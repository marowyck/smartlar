import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AgendarDialog } from '@/features/pedidos/components/AgendarDialog'
import { CancelarDialog } from '@/features/pedidos/components/CancelarDialog'
import { ConcluirDialog } from '@/features/pedidos/components/ConcluirDialog'
import { StatusTimeline } from '@/features/pedidos/components/StatusTimeline'
import { calcularTotal } from '@/features/pedidos/domain/calculos'
import { STATUS_ACAO, STATUS_LABEL, TRANSICOES, exigeAgendamento } from '@/features/pedidos/domain/status'
import { useAtualizarPedido } from '@/features/pedidos/hooks/useAtualizarPedido'
import { usePedido } from '@/features/pedidos/hooks/usePedido'
import type { ModoPainel } from '@/store/painel-context'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { StatusBadge } from '@/features/pedidos/components/StatusBadge'
import { mensagemErro } from '@/utils/errors'
import { formatDataHora } from '@/utils/format'
import { FORMAS_PAGAMENTO, formatBRL, labelFormaPagamento, numeroPedido, type FormaPagamento } from '@/utils/money'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

export function PedidoDialog({
  id,
  modo,
  aberto,
  onOpenChange,
  onModo,
  onAbrirCliente,
}: {
  id: string
  modo: ModoPainel
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  onModo: (modo: ModoPainel) => void
  onAbrirCliente: (id: string) => void
}) {
  const pedido = usePedido(aberto ? id : '')
  const atualizar = useAtualizarPedido(id)
  const [agendarAberto, setAgendarAberto] = useState(false)
  const [cancelarAberto, setCancelarAberto] = useState(false)
  const [concluirAberto, setConcluirAberto] = useState(false)
  const [tecnicoId, setTecnicoId] = useState('')
  const [dataLocal, setDataLocal] = useState('')
  const [pagamento, setPagamento] = useState<FormaPagamento>('pix')
  const [observacoes, setObservacoes] = useState<string | null>(null)
  const dados = pedido.data
  const editando = modo === 'editar'
  const proximos = dados ? TRANSICOES[dados.status] : []
  const avancar = proximos.find((status) => status !== 'cancelado')
  const podeCancelar = proximos.includes('cancelado')
  const encerrado = dados?.status === 'concluido' || dados?.status === 'cancelado'
  const somaItens = dados
    ? calcularTotal(dados.itens_pedido.map((item) => ({ quantidade: item.quantidade, precoUnitario: item.preco_unitario })))
    : 0
  const textoObservacoes = observacoes ?? dados?.observacoes ?? ''

  function salvar(campos: Parameters<typeof atualizar.mutate>[0]) {
    atualizar.mutate(campos, {
      onSuccess: () => {
        toast.success('Pedido atualizado')
        setAgendarAberto(false)
        setCancelarAberto(false)
        setConcluirAberto(false)
        setObservacoes(null)
      },
      onError: (error) => toast.error(mensagemErro(error)),
    })
  }

  function seguir() {
    if (!dados || !avancar) return
    if (exigeAgendamento(avancar)) {
      setTecnicoId(dados.tecnico_id ?? '')
      setDataLocal('')
      setAgendarAberto(true)
      return
    }
    if (avancar === 'concluido' && !dados.forma_pagamento) {
      setConcluirAberto(true)
      return
    }
    salvar({ status: avancar })
  }

  function confirmarAgenda() {
    if (!tecnicoId || !dataLocal) {
      toast.error('Selecione o técnico e a data de instalação')
      return
    }
    const data = new Date(dataLocal)
    if (Number.isNaN(data.getTime())) {
      toast.error('Data inválida')
      return
    }
    salvar({ status: 'agendado', tecnico_id: tecnicoId, data_instalacao: data.toISOString() })
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,860px)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{dados ? `Pedido ${numeroPedido(dados.numero)}` : 'Pedido'}</DialogTitle>
          <DialogDescription>
            {editando
              ? 'O status só anda para a frente. Cancelar só sai de orçamento ou aprovado.'
              : 'Consulta do pedido, dos itens e do histórico.'}
          </DialogDescription>
        </DialogHeader>
        {editando ? (
        <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => onModo('ver')}>
              Visualizar
            </Button>
          {avancar ? (
            <Button onClick={seguir} disabled={atualizar.isPending}>
              {STATUS_ACAO[avancar]}
            </Button>
          ) : null}
          {podeCancelar ? (
            <Button variant="destructive" onClick={() => setCancelarAberto(true)} disabled={atualizar.isPending}>
              Cancelar pedido
            </Button>
          ) : null}
        </div>
        ) : null}
        <QueryBoundary isLoading={pedido.isLoading} error={pedido.error} onRetry={() => void pedido.refetch()}>
          {dados ? (
            <div className="space-y-4">
              <StatusBadge status={dados.status} />
              <StatusTimeline status={dados.status} />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Qtd.</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dados.itens_pedido.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>{item.produtos?.nome ?? 'Produto'}</div>
                          <div className="text-xs text-muted-foreground">{item.produtos?.categoria}</div>
                        </TableCell>
                        <TableCell className="tabular-nums">{item.quantidade}</TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">{formatBRL(item.preco_unitario)}</TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">{formatBRL(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3}>Total</TableCell>
                      <TableCell className="tabular-nums">{formatBRL(dados.valor_total)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
              {Math.abs(somaItens - dados.valor_total) > 0.009 ? (
                <p className="text-sm text-destructive">A soma dos itens ({formatBRL(somaItens)}) não bate com o total salvo.</p>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Cliente</p>
                  {dados.clientes ? (
                    <>
                      <button type="button" className="font-medium text-primary underline-offset-4 hover:underline" onClick={() => onAbrirCliente(dados.clientes!.id)}>
                        {dados.clientes.nome}
                      </button>
                      <p>{dados.clientes.telefone}</p>
                      <p>{dados.clientes.email || 'Sem e-mail'}</p>
                      <p className="break-words text-muted-foreground">{dados.clientes.endereco}</p>
                    </>
                  ) : (
                    <p>Cliente não encontrado</p>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Instalação</p>
                  <p>
                    <span className="text-muted-foreground">Técnico: </span>
                    {dados.tecnicos?.nome ?? 'Não definido'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Data: </span>
                    {formatDataHora(dados.data_instalacao)}
                  </p>
                  {editando && !encerrado ? (
                    <div className="grid gap-1.5">
                      <Label htmlFor="pedido-observacoes">Observações</Label>
                      <Textarea id="pedido-observacoes" value={textoObservacoes} onChange={(event) => setObservacoes(event.target.value)} />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={atualizar.isPending || textoObservacoes === (dados.observacoes ?? '')}
                        onClick={() => salvar({ observacoes: textoObservacoes.trim() || null })}
                      >
                        Salvar observações
                      </Button>
                    </div>
                  ) : (
                    <p className="break-words">
                      <span className="text-muted-foreground">Observações: </span>
                      {dados.observacoes || '—'}
                    </p>
                  )}
                  {editando ? (
                    <div className="grid gap-1.5">
                      <Label>Forma de pagamento</Label>
                      <Select
                        value={dados.forma_pagamento ?? 'nenhuma'}
                        disabled={encerrado || atualizar.isPending}
                        onValueChange={(value) => {
                          if (value === 'nenhuma' || value === dados.forma_pagamento) return
                          salvar({ forma_pagamento: value as FormaPagamento })
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
                      {labelFormaPagamento(dados.forma_pagamento)}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Histórico de status</p>
                {dados.historico_status.map((evento) => (
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
              {editando ? null : (
                <div className="flex justify-end">
                  <Button type="button" size="icon" aria-label="Editar" onClick={() => onModo('editar')}>
                    <Pencil />
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </QueryBoundary>
      </DialogContent>
      <AgendarDialog
        aberto={agendarAberto}
        tecnicoId={tecnicoId}
        dataLocal={dataLocal}
        pendente={atualizar.isPending}
        onOpenChange={setAgendarAberto}
        onTecnico={setTecnicoId}
        onData={setDataLocal}
        onConfirmar={confirmarAgenda}
      />
      <ConcluirDialog
        aberto={concluirAberto}
        pagamento={pagamento}
        pendente={atualizar.isPending}
        onOpenChange={setConcluirAberto}
        onPagamento={setPagamento}
        onConfirmar={() => salvar({ status: 'concluido', forma_pagamento: pagamento })}
      />
      <CancelarDialog aberto={cancelarAberto} onOpenChange={setCancelarAberto} onConfirmar={() => salvar({ status: 'cancelado' })} />
    </Dialog>
  )
}
