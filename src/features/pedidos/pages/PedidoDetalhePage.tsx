import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AgendarDialog } from '@/features/pedidos/components/AgendarDialog'
import { CancelarDialog } from '@/features/pedidos/components/CancelarDialog'
import { ConcluirDialog } from '@/features/pedidos/components/ConcluirDialog'
import { StatusTimeline } from '@/features/pedidos/components/StatusTimeline'
import { calcularTotal } from '@/features/pedidos/domain/calculos'
import { STATUS_ACAO, STATUS_LABEL, TRANSICOES, exigeAgendamento } from '@/features/pedidos/domain/status'
import { useAtualizarPedido } from '@/features/pedidos/hooks/useAtualizarPedido'
import { usePedido } from '@/features/pedidos/hooks/usePedido'
import { PageContainer, PageHeader } from '@/shared/components/PageHeader'
import { QueryBoundary } from '@/shared/components/QueryBoundary'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { mensagemErro } from '@/shared/lib/errors'
import { formatDataHora } from '@/shared/lib/format'
import { FORMAS_PAGAMENTO, formatBRL, labelFormaPagamento, numeroPedido, type FormaPagamento } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function PedidoDetalhePage() {
  const { id = '' } = useParams()
  const pedido = usePedido(id)
  const atualizar = useAtualizarPedido(id)
  const [agendarAberto, setAgendarAberto] = useState(false)
  const [cancelarAberto, setCancelarAberto] = useState(false)
  const [concluirAberto, setConcluirAberto] = useState(false)
  const [tecnicoId, setTecnicoId] = useState('')
  const [dataLocal, setDataLocal] = useState('')
  const [pagamento, setPagamento] = useState<FormaPagamento>('pix')
  const dados = pedido.data
  const proximos = dados ? TRANSICOES[dados.status] : []
  const avancar = proximos.find((status) => status !== 'cancelado')
  const podeCancelar = proximos.includes('cancelado')
  const encerrado = dados?.status === 'concluido' || dados?.status === 'cancelado'
  const somaItens = dados
    ? calcularTotal(dados.itens_pedido.map((item) => ({ quantidade: item.quantidade, precoUnitario: item.preco_unitario })))
    : 0

  function salvar(campos: Parameters<typeof atualizar.mutate>[0]) {
    atualizar.mutate(campos, {
      onSuccess: () => {
        toast.success('Pedido atualizado')
        setAgendarAberto(false)
        setCancelarAberto(false)
        setConcluirAberto(false)
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
    <PageContainer>
      <PageHeader
        title={dados ? `Pedido ${numeroPedido(dados.numero)}` : 'Pedido'}
        description="O status só anda para a frente. Cancelar só sai de orçamento ou aprovado."
        action={
          dados ? (
            <>
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
            </>
          ) : null
        }
      />
      <QueryBoundary isLoading={pedido.isLoading} error={pedido.error} onRetry={() => void pedido.refetch()}>
        {dados ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={dados.status} />
            </div>
            <StatusTimeline status={dados.status} />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Itens</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                    {Math.abs(somaItens - dados.valor_total) > 0.009 ? (
                      <p className="mt-3 text-sm text-destructive">
                        A soma dos itens ({formatBRL(somaItens)}) não bate com o total salvo.
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dados.historico_status.map((evento) => (
                      <div key={evento.id} className="border-l-2 border-primary/40 pl-3">
                        <p className="text-sm font-medium">
                          {evento.status_anterior
                            ? `${STATUS_LABEL[evento.status_anterior]} → ${STATUS_LABEL[evento.status_novo]}`
                            : `Criado como ${STATUS_LABEL[evento.status_novo]}`}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDataHora(evento.alterado_em)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    {dados.clientes ? (
                      <>
                        <Link className="font-medium underline-offset-4 hover:underline" to={`/clientes/${dados.clientes.id}`}>
                          {dados.clientes.nome}
                        </Link>
                        <p>{dados.clientes.telefone}</p>
                        <p>{dados.clientes.email || 'Sem e-mail'}</p>
                        <p className="break-words text-muted-foreground">{dados.clientes.endereco}</p>
                      </>
                    ) : (
                      <p>Cliente não encontrado</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Instalação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Técnico: </span>
                      {dados.tecnicos?.nome ?? 'Não definido'}
                    </p>
                    {dados.tecnicos ? <p className="text-muted-foreground">{dados.tecnicos.especialidade}</p> : null}
                    <p>
                      <span className="text-muted-foreground">Data: </span>
                      {formatDataHora(dados.data_instalacao)}
                    </p>
                    <p className="break-words">
                      <span className="text-muted-foreground">Observações: </span>
                      {dados.observacoes || '—'}
                    </p>
                    <div className="grid gap-1.5 pt-2">
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
                      <p className="text-xs text-muted-foreground">Atual: {labelFormaPagamento(dados.forma_pagamento)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : null}
      </QueryBoundary>
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
    </PageContainer>
  )
}
