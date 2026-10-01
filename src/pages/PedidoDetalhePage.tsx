import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader, QueryState } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { atualizarPedido, listarTecnicos, obterPedido } from '@/lib/api'
import { mensagemErro } from '@/lib/errors'
import { formatDataHora } from '@/lib/format'
import {
  FORMAS_PAGAMENTO,
  calcularTotal,
  formatBRL,
  labelFormaPagamento,
  numeroPedido,
  type FormaPagamento,
} from '@/lib/money'
import { STATUS_ACAO, STATUS_LABEL, TRANSICOES, exigeAgendamento } from '@/lib/status'
import type { AtualizarPedidoInput } from '@/lib/types'

export function PedidoDetalhePage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const pedido = useQuery({ queryKey: ['pedidos', 'detalhe', id], queryFn: () => obterPedido(id), enabled: Boolean(id) })
  const tecnicos = useQuery({ queryKey: ['tecnicos'], queryFn: listarTecnicos })
  const [agendarAberto, setAgendarAberto] = useState(false)
  const [cancelarAberto, setCancelarAberto] = useState(false)
  const [concluirAberto, setConcluirAberto] = useState(false)
  const [tecnicoId, setTecnicoId] = useState('')
  const [dataLocal, setDataLocal] = useState('')
  const [pagamento, setPagamento] = useState<FormaPagamento>('pix')

  const atualizar = useMutation({
    mutationFn: (campos: AtualizarPedidoInput) => atualizarPedido(id, campos),
    onSuccess: async () => {
      toast.success('Pedido atualizado')
      setAgendarAberto(false)
      setCancelarAberto(false)
      setConcluirAberto(false)
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      await queryClient.invalidateQueries({ queryKey: ['agenda'] })
    },
    onError: (error) => toast.error(mensagemErro(error)),
  })

  const dados = pedido.data
  const proximos = dados ? TRANSICOES[dados.status] : []
  const avancar = proximos.find((status) => status !== 'cancelado')
  const podeCancelar = proximos.includes('cancelado')
  const encerrado = dados?.status === 'concluido' || dados?.status === 'cancelado'
  const somaItens = dados
    ? calcularTotal(
        dados.itens_pedido.map((item) => ({
          quantidade: item.quantidade,
          precoUnitario: item.preco_unitario,
        })),
      )
    : 0

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
    atualizar.mutate({ status: avancar })
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
    atualizar.mutate({
      status: 'agendado',
      tecnico_id: tecnicoId,
      data_instalacao: data.toISOString(),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={dados ? `Pedido ${numeroPedido(dados.numero)}` : 'Pedido'}
        description="O status só anda para a frente. Cancelar só sai de orçamento ou aprovado."
        action={
          dados ? (
            <div className="flex flex-wrap gap-2">
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
          ) : null
        }
      />

      <QueryState isLoading={pedido.isLoading} error={pedido.error}>
        {dados ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-3">
                    <span>Itens</span>
                    <StatusBadge status={dados.status} />
                  </CardTitle>
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
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>{formatBRL(item.preco_unitario)}</TableCell>
                          <TableCell>{formatBRL(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell>{formatBRL(dados.valor_total)}</TableCell>
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
                    <div key={evento.id} className="border-l-2 pl-3">
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
                      <p className="text-muted-foreground">{dados.clientes.endereco}</p>
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
                  <p><span className="text-muted-foreground">Técnico: </span>{dados.tecnicos?.nome ?? 'Não definido'}</p>
                  {dados.tecnicos ? <p className="text-muted-foreground">{dados.tecnicos.especialidade}</p> : null}
                  <p><span className="text-muted-foreground">Data: </span>{formatDataHora(dados.data_instalacao)}</p>
                  <p><span className="text-muted-foreground">Observações: </span>{dados.observacoes || '—'}</p>
                  <div className="grid gap-1.5 pt-2">
                    <Label>Forma de pagamento</Label>
                    <Select
                      value={dados.forma_pagamento ?? 'nenhuma'}
                      disabled={encerrado || atualizar.isPending}
                      onValueChange={(value) => {
                        if (value === 'nenhuma' || value === dados.forma_pagamento) return
                        atualizar.mutate({ forma_pagamento: value as FormaPagamento })
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
        ) : null}
      </QueryState>

      <Dialog open={agendarAberto} onOpenChange={setAgendarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar instalação</DialogTitle>
            <DialogDescription>Técnico e data são obrigatórios para sair de aprovado.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Técnico</Label>
              <Select value={tecnicoId || undefined} onValueChange={setTecnicoId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {(tecnicos.data ?? []).map((tecnico) => (
                    <SelectItem key={tecnico.id} value={tecnico.id}>
                      {tecnico.nome} — {tecnico.especialidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Data e horário</Label>
              <Input type="datetime-local" value={dataLocal} onChange={(event) => setDataLocal(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={confirmarAgenda} disabled={atualizar.isPending}>
              Confirmar agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={concluirAberto} onOpenChange={setConcluirAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concluir instalação</DialogTitle>
            <DialogDescription>Informe como o cliente pagou para o controle do faturamento.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label>Forma de pagamento</Label>
            <Select value={pagamento} onValueChange={(value) => setPagamento(value as FormaPagamento)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAS_PAGAMENTO.map((forma) => (
                  <SelectItem key={forma.value} value={forma.value}>
                    {forma.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              onClick={() => atualizar.mutate({ status: 'concluido', forma_pagamento: pagamento })}
              disabled={atualizar.isPending}
            >
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelarAberto} onOpenChange={setCancelarAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar este pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não volta. O pedido deixa de entrar no valor a receber.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => atualizar.mutate({ status: 'cancelado' })}>
              Cancelar pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
