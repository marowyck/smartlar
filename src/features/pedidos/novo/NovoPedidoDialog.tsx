import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { ClienteForm } from '@/features/clientes/components/ClienteForm'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { calcularTotal } from '@/features/pedidos/domain/calculos'
import { useCriarPedido } from '@/features/pedidos/hooks/useCriarPedido'
import { ClientePicker } from '@/features/pedidos/novo/ClientePicker'
import { ItemPedidoRow } from '@/features/pedidos/novo/ItemPedidoRow'
import { pedidoSchema, type PedidoFormValues } from '@/features/pedidos/schemas'
import { useProdutos } from '@/features/produtos/hooks/useProdutos'
import { cn } from '@/utils/cn'
import { mensagemErro } from '@/utils/errors'
import { FORMAS_PAGAMENTO, formatBRL, isFormaPagamento } from '@/utils/money'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const passos = ['Cliente', 'Itens', 'Resumo']

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
          <NovoPedidoForm clienteInicial={clienteInicial} onCriado={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function NovoPedidoForm({
  clienteInicial,
  onCriado,
}: {
  clienteInicial?: string
  onCriado: () => void
}) {
  const [passo, setPasso] = useState(0)
  const [clienteAberto, setClienteAberto] = useState(false)
  const clientes = useClientes('')
  const produtos = useProdutos()
  const ativos = (produtos.data ?? []).filter((produto) => produto.ativo)
  const form = useForm<PedidoFormValues>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      cliente_id: clienteInicial ?? '',
      observacoes: '',
      forma_pagamento: 'nenhuma',
      itens: [{ produto_id: '', quantidade: 1 }],
    },
  })
  const linhas = useFieldArray({ control: form.control, name: 'itens' })
  const itens = useWatch({ control: form.control, name: 'itens' })
  const clienteId = useWatch({ control: form.control, name: 'cliente_id' })
  const cliente = clientes.data?.find((item) => item.id === clienteId)
  const total = calcularTotal(
    (itens ?? []).map((item) => ({
      quantidade: Number(item.quantidade) || 0,
      precoUnitario: ativos.find((produto) => produto.id === item.produto_id)?.preco_unitario ?? 0,
    })),
  )
  const mutation = useCriarPedido()

  async function avancar() {
    if (passo === 0) {
      const ok = await form.trigger('cliente_id')
      if (ok) setPasso(1)
      return
    }
    const ok = await form.trigger('itens')
    if (ok) setPasso(2)
  }

  return (
    <>
      <ol className="grid grid-cols-3 gap-2">
        {passos.map((nome, index) => (
          <li
            key={nome}
            className={cn(
              'rounded-lg border px-2 py-1.5 text-xs sm:text-sm',
              index === passo && 'border-primary bg-primary/10 font-medium text-primary',
              index < passo && 'bg-muted text-muted-foreground',
            )}
          >
            {index + 1}. {nome}
          </li>
        ))}
      </ol>

      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) =>
          mutation.mutate(
            {
              cliente_id: values.cliente_id,
              observacoes: values.observacoes,
              forma_pagamento: isFormaPagamento(values.forma_pagamento) ? values.forma_pagamento : null,
              itens: values.itens,
            },
            {
              onSuccess: () => {
                toast.success('Orçamento salvo')
                onCriado()
              },
            },
          ),
        )}
      >
        {passo === 0 ? (
          <div className="space-y-3">
            <ClientePicker
              clientes={clientes.data ?? []}
              value={clienteId}
              onChange={(id) => form.setValue('cliente_id', id, { shouldValidate: true })}
            />
            {form.formState.errors.cliente_id ? (
              <p className="text-xs text-destructive">{form.formState.errors.cliente_id.message}</p>
            ) : null}
            {cliente ? <p className="break-words text-sm text-muted-foreground">{cliente.endereco}</p> : null}
            <Button type="button" variant="outline" onClick={() => setClienteAberto(true)}>
              Cadastrar cliente na hora
            </Button>
          </div>
        ) : null}

        {passo === 1 ? (
          <div className="space-y-3">
            {linhas.fields.map((field, index) => (
              <ItemPedidoRow
                key={field.id}
                index={index}
                control={form.control}
                errors={form.formState.errors}
                produtos={ativos}
                produtoId={itens?.[index]?.produto_id ?? ''}
                quantidade={Number(itens?.[index]?.quantidade) || 0}
                podeRemover={linhas.fields.length > 1}
                onQuantidade={(valor) => form.setValue(`itens.${index}.quantidade`, valor, { shouldValidate: true })}
                onRemover={() => linhas.remove(index)}
              />
            ))}
            {form.formState.errors.itens?.message ? (
              <p className="text-sm text-destructive">{form.formState.errors.itens.message}</p>
            ) : null}
            {form.formState.errors.itens?.root?.message ? (
              <p className="text-sm text-destructive">{form.formState.errors.itens.root.message}</p>
            ) : null}
            <Button type="button" variant="outline" onClick={() => linhas.append({ produto_id: '', quantidade: 1 })}>
              Adicionar produto
            </Button>
          </div>
        ) : null}

        {passo === 2 ? (
          <div className="grid gap-3">
            <p className="text-sm">
              Cliente: <span className="font-medium">{cliente?.nome ?? '—'}</span>
            </p>
            <Textarea {...form.register('observacoes')} placeholder="Ex.: portão eletrônico antigo, verificar compatibilidade" />
            <div className="grid gap-1.5">
              <Label>Forma de pagamento</Label>
              <Controller
                control={form.control}
                name="forma_pagamento"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Opcional" />
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
                )}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <p className="text-lg font-semibold tabular-nums">{formatBRL(total)}</p>
          <div className="flex gap-2">
            {passo > 0 ? (
              <Button type="button" variant="outline" onClick={() => setPasso((atual) => atual - 1)}>
                Voltar
              </Button>
            ) : null}
            {passo < 2 ? (
              <Button type="button" onClick={() => void avancar()}>
                Continuar
              </Button>
            ) : (
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : 'Salvar orçamento'}
              </Button>
            )}
          </div>
        </div>
        {mutation.error ? <p className="text-sm text-destructive">{mensagemErro(mutation.error)}</p> : null}
      </form>

      <Dialog open={clienteAberto} onOpenChange={setClienteAberto}>
        <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
            <DialogDescription>O cliente fica selecionado neste pedido.</DialogDescription>
          </DialogHeader>
          <ClienteForm
            submitLabel="Salvar e usar neste pedido"
            onCreated={(criado) => {
              form.setValue('cliente_id', criado.id, { shouldValidate: true })
              setClienteAberto(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
