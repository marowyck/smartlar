import { Controller } from 'react-hook-form'
import { ClienteForm } from '@/features/clientes/components/ClienteForm'
import { ClientePicker } from '@/features/pedidos/components/ClientePicker'
import { ItemPedidoRow } from '@/features/pedidos/components/ItemPedidoRow'
import { PASSOS_NOVO_PEDIDO, useNovoPedidoForm } from '@/features/pedidos/hooks/useNovoPedidoForm'
import { cn } from '@/utils/cn'
import { mensagemErro } from '@/utils/errors'
import { FORMAS_PAGAMENTO, formatBRL } from '@/utils/money'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function NovoPedidoPassos({ clienteInicial, onCriado }: { clienteInicial?: string; onCriado: () => void }) {
  const fluxo = useNovoPedidoForm(clienteInicial, onCriado)
  const { form, linhas, itens, clienteId, cliente, subtotal, desconto, total, mutation } = fluxo

  return (
    <>
      <ol className="grid grid-cols-3 gap-2">
        {PASSOS_NOVO_PEDIDO.map((nome, index) => (
          <li
            key={nome}
            className={cn(
              'rounded-lg border px-2 py-1.5 text-xs sm:text-sm',
              index === fluxo.passo && 'border-primary bg-primary/10 font-medium text-primary',
              index < fluxo.passo && 'bg-muted text-muted-foreground',
            )}
          >
            {index + 1}. {nome}
          </li>
        ))}
      </ol>

      <form className="grid gap-4" onSubmit={form.handleSubmit(fluxo.enviar)}>
        {fluxo.passo === 0 ? (
          <div className="space-y-3">
            <ClientePicker
              clientes={fluxo.clientes.data ?? []}
              value={clienteId}
              onChange={(id) => form.setValue('cliente_id', id, { shouldValidate: true })}
            />
            {form.formState.errors.cliente_id ? (
              <p className="text-xs text-destructive">{form.formState.errors.cliente_id.message}</p>
            ) : null}
            {cliente ? <p className="break-words text-sm text-muted-foreground">{cliente.endereco}</p> : null}
            <Button type="button" variant="outline" onClick={() => fluxo.setClienteAberto(true)}>
              Cadastrar cliente na hora
            </Button>
          </div>
        ) : null}

        {fluxo.passo === 1 ? (
          <div className="space-y-3">
            {linhas.fields.map((field, index) => (
              <ItemPedidoRow
                key={field.id}
                index={index}
                control={form.control}
                errors={form.formState.errors}
                produtos={fluxo.ativos}
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
            <div className="grid max-w-xs gap-1.5">
              <Label htmlFor="desconto-novo">Desconto (R$)</Label>
              <Input id="desconto-novo" type="number" step="0.01" min="0" {...form.register('desconto', { valueAsNumber: true })} />
              {form.formState.errors.desconto ? (
                <p className="text-xs text-destructive">{form.formState.errors.desconto.message}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {fluxo.passo === 2 ? (
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
          <div className="text-sm">
            {desconto > 0 ? (
              <p className="text-muted-foreground">
                Subtotal {formatBRL(subtotal)} − desconto {formatBRL(desconto)}
              </p>
            ) : null}
            <p className="text-lg font-semibold tabular-nums">{formatBRL(total)}</p>
          </div>
          <div className="flex gap-2">
            {fluxo.passo > 0 ? (
              <Button type="button" variant="outline" onClick={() => fluxo.setPasso((atual) => atual - 1)}>
                Voltar
              </Button>
            ) : null}
            {fluxo.passo < 2 ? (
              <Button type="button" onClick={() => void fluxo.avancar()}>
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

      <Dialog open={fluxo.clienteAberto} onOpenChange={fluxo.setClienteAberto}>
        <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
            <DialogDescription>O cliente fica selecionado neste pedido.</DialogDescription>
          </DialogHeader>
          <ClienteForm
            submitLabel="Salvar e usar neste pedido"
            onCreated={(criado) => {
              form.setValue('cliente_id', criado.id, { shouldValidate: true })
              fluxo.setClienteAberto(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
