import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ClienteForm } from '@/features/clientes/components/ClienteForm'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { ClientePicker } from '@/features/pedidos/novo/ClientePicker'
import { ItemPedidoRow } from '@/features/pedidos/novo/ItemPedidoRow'
import { calcularTotal } from '@/features/pedidos/domain/calculos'
import { useCriarPedido } from '@/features/pedidos/hooks/useCriarPedido'
import { pedidoSchema, type PedidoFormValues } from '@/features/pedidos/schemas'
import { useProdutos } from '@/features/produtos/hooks/useProdutos'
import { PageContainer, PageHeader } from '@/shared/components/PageHeader'
import { cn } from '@/shared/lib/cn'
import { mensagemErro } from '@/shared/lib/errors'
import { FORMAS_PAGAMENTO, formatBRL, isFormaPagamento } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'

const passos = ['Cliente', 'Itens', 'Resumo']

export function NovoPedidoPage() {
  const navigate = useNavigate()
  const [passo, setPasso] = useState(0)
  const [clienteAberto, setClienteAberto] = useState(false)
  const clientes = useClientes('')
  const produtos = useProdutos()
  const ativos = (produtos.data ?? []).filter((produto) => produto.ativo)
  const form = useForm<PedidoFormValues>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      cliente_id: '',
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
    if (passo === 1) {
      const ok = await form.trigger('itens')
      if (ok) setPasso(2)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Novo pedido"
        description="O pedido nasce como orçamento. O total é a soma dos itens e o banco confirma o valor."
      />
      <ol className="grid grid-cols-3 gap-2">
        {passos.map((nome, index) => (
          <li
            key={nome}
            className={cn(
              'rounded-xl border px-3 py-2 text-sm',
              index === passo && 'border-primary bg-primary/10 font-medium text-primary',
              index < passo && 'bg-muted text-muted-foreground',
            )}
          >
            {index + 1}. {nome}
          </li>
        ))}
      </ol>
      <form
        className="grid gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_280px] lg:pb-0"
        onSubmit={form.handleSubmit((values) =>
          mutation.mutate(
            {
              cliente_id: values.cliente_id,
              observacoes: values.observacoes,
              forma_pagamento: isFormaPagamento(values.forma_pagamento) ? values.forma_pagamento : null,
              itens: values.itens,
            },
            {
              onSuccess: (id) => {
                toast.success('Orçamento salvo')
                navigate(`/pedidos/${id}`)
              },
            },
          ),
        )}
      >
        <div className="space-y-6">
          {passo === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          ) : null}

          {passo === 1 ? (
            <Card>
              <CardHeader>
                <CardTitle>Produtos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          ) : null}

          {passo === 2 ? (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
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
              </CardContent>
            </Card>
          ) : null}

          <div className="hidden gap-2 lg:flex">
            {passo > 0 ? (
              <Button type="button" variant="outline" onClick={() => setPasso((atual) => atual - 1)}>
                Voltar
              </Button>
            ) : null}
            {passo < 2 ? (
              <Button type="button" onClick={() => void avancar()}>
                Continuar
              </Button>
            ) : null}
          </div>
        </div>

        <Card className="hidden h-fit lg:sticky lg:top-6 lg:block">
          <CardHeader>
            <CardTitle>Total do orçamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-semibold tracking-tight tabular-nums">{formatBRL(total)}</p>
            <p className="text-xs text-muted-foreground">Cada item guarda o preço do catálogo no momento em que o pedido é salvo.</p>
            {mutation.error ? <p className="text-sm text-destructive">{mensagemErro(mutation.error)}</p> : null}
            <Button type="submit" className="w-full" disabled={mutation.isPending || passo < 2}>
              {mutation.isPending ? 'Salvando...' : 'Salvar como orçamento'}
            </Button>
          </CardContent>
        </Card>

        <div className="fixed inset-x-0 bottom-16 z-20 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold tabular-nums">{formatBRL(total)}</p>
            </div>
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
          {mutation.error ? <p className="mt-2 text-sm text-destructive">{mensagemErro(mutation.error)}</p> : null}
        </div>
      </form>

      <Dialog open={clienteAberto} onOpenChange={setClienteAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
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
    </PageContainer>
  )
}
