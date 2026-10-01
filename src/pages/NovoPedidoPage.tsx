import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { ClienteForm } from '@/components/ClienteForm'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { criarPedido, listarClientes, listarProdutos } from '@/lib/api'
import { mensagemErro } from '@/lib/errors'
import {
  FORMAS_PAGAMENTO,
  calcularSubtotal,
  calcularTotal,
  formatBRL,
  isFormaPagamento,
} from '@/lib/money'

const schema = z
  .object({
    cliente_id: z.string().uuid('Selecione um cliente'),
    observacoes: z.string(),
    forma_pagamento: z.string(),
    itens: z
      .array(
        z.object({
          produto_id: z.string().uuid('Selecione um produto'),
          quantidade: z.number().int().positive('Quantidade inválida'),
        }),
      )
      .min(1, 'Adicione pelo menos um produto'),
  })
  .superRefine((value, ctx) => {
    const ids = value.itens.map((item) => item.produto_id).filter(Boolean)
    const repetido = ids.find((id, index) => ids.indexOf(id) !== index)
    if (repetido) {
      ctx.addIssue({
        code: 'custom',
        message: 'Não repita o mesmo produto. Aumente a quantidade na linha existente.',
        path: ['itens'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

export function NovoPedidoPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [clienteAberto, setClienteAberto] = useState(false)
  const clientes = useQuery({ queryKey: ['clientes', ''], queryFn: () => listarClientes() })
  const produtos = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos })
  const ativos = (produtos.data ?? []).filter((produto) => produto.ativo)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cliente_id: '',
      observacoes: '',
      forma_pagamento: 'nenhuma',
      itens: [{ produto_id: '', quantidade: 1 }],
    },
  })
  const linhas = useFieldArray({ control: form.control, name: 'itens' })
  const itens = form.watch('itens')
  const clienteId = form.watch('cliente_id')
  const cliente = clientes.data?.find((item) => item.id === clienteId)

  const total = calcularTotal(
    itens.map((item) => ({
      quantidade: Number(item.quantidade) || 0,
      precoUnitario: ativos.find((produto) => produto.id === item.produto_id)?.preco_unitario ?? 0,
    })),
  )

  const mutation = useMutation({
    mutationFn: criarPedido,
    onSuccess: (id) => {
      toast.success('Orçamento salvo')
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      navigate(`/pedidos/${id}`)
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo pedido"
        description="O pedido nasce como orçamento. O total é a soma dos itens e o banco confirma o valor."
      />

      <form
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"
        onSubmit={form.handleSubmit((values) =>
          mutation.mutate({
            cliente_id: values.cliente_id,
            observacoes: values.observacoes,
            forma_pagamento: isFormaPagamento(values.forma_pagamento) ? values.forma_pagamento : null,
            itens: values.itens,
          }),
        )}
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Cliente</CardTitle>
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
              {cliente ? <p className="text-sm text-muted-foreground">{cliente.endereco}</p> : null}
              <Button type="button" variant="outline" onClick={() => setClienteAberto(true)}>
                Cadastrar cliente na hora
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Produtos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {linhas.fields.map((field, index) => {
                const produtoId = itens[index]?.produto_id
                const quantidade = Number(itens[index]?.quantidade) || 0
                const preco = ativos.find((produto) => produto.id === produtoId)?.preco_unitario ?? 0
                return (
                  <div key={field.id} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_120px_140px_auto] md:items-end">
                    <div className="grid gap-1.5">
                      <Label>Produto</Label>
                      <Controller
                        control={form.control}
                        name={`itens.${index}.produto_id`}
                        render={({ field: produtoField }) => (
                          <Select value={produtoField.value || undefined} onValueChange={produtoField.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {ativos.map((produto) => (
                                <SelectItem key={produto.id} value={produto.id}>
                                  {produto.nome} · {formatBRL(produto.preco_unitario)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.itens?.[index]?.produto_id ? (
                        <p className="text-xs text-destructive">{form.formState.errors.itens[index]?.produto_id?.message}</p>
                      ) : null}
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Qtd.</Label>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        {...form.register(`itens.${index}.quantidade`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="grid gap-1">
                      <span className="text-xs text-muted-foreground">Subtotal</span>
                      <p className="text-sm font-medium">{formatBRL(calcularSubtotal(quantidade, preco))}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={linhas.fields.length === 1}
                      onClick={() => linhas.remove(index)}
                    >
                      Remover
                    </Button>
                  </div>
                )
              })}
              {form.formState.errors.itens?.message ? (
                <p className="text-sm text-destructive">{form.formState.errors.itens.message}</p>
              ) : null}
              {form.formState.errors.itens?.root?.message ? (
                <p className="text-sm text-destructive">{form.formState.errors.itens.root.message}</p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => linhas.append({ produto_id: '', quantidade: 1 })}
              >
                Adicionar produto
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Observações</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Textarea
                {...form.register('observacoes')}
                placeholder="Ex.: portão eletrônico antigo, verificar compatibilidade"
              />
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
        </div>

        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Total do orçamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-semibold tracking-tight">{formatBRL(total)}</p>
            <p className="text-xs text-muted-foreground">
              Cada item guarda o preço do catálogo no momento em que o pedido é salvo.
            </p>
            {mutation.error ? <p className="text-sm text-destructive">{mensagemErro(mutation.error)}</p> : null}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Salvar como orçamento'}
            </Button>
          </CardContent>
        </Card>
      </form>

      <Dialog open={clienteAberto} onOpenChange={setClienteAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
          </DialogHeader>
          <ClienteForm
            submitLabel="Salvar e usar neste pedido"
            onCreated={(cliente) => {
              void queryClient.invalidateQueries({ queryKey: ['clientes'] })
              form.setValue('cliente_id', cliente.id, { shouldValidate: true })
              setClienteAberto(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ClientePicker({
  clientes,
  value,
  onChange,
}: {
  clientes: { id: string; nome: string; telefone: string }[]
  value: string
  onChange: (id: string) => void
}) {
  const [aberto, setAberto] = useState(false)
  const selecionado = clientes.find((cliente) => cliente.id === value)

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between">
          {selecionado ? `${selecionado.nome} · ${selecionado.telefone}` : 'Selecionar cliente'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar por nome ou telefone" />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            <CommandGroup>
              {clientes.map((cliente) => (
                <CommandItem
                  key={cliente.id}
                  value={`${cliente.nome} ${cliente.telefone}`}
                  onSelect={() => {
                    onChange(cliente.id)
                    setAberto(false)
                  }}
                >
                  <span>{cliente.nome}</span>
                  <span className="text-muted-foreground">{cliente.telefone}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
