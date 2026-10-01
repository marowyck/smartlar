import { CirclePlus, Pencil } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { clienteSchema, type ClienteFormValues } from '@/features/clientes/schemas'
import { useAtualizarCliente, useCliente, usePedidosDoCliente } from '@/features/clientes/hooks/useClientes'
import { useNovoPedido } from '@/features/pedidos/novo/novo-pedido-context'
import type { ModoPainel } from '@/app/layouts/painel-context'
import { EmptyState } from '@/shared/components/EmptyState'
import { Field } from '@/shared/components/Field'
import { QueryBoundary } from '@/shared/components/QueryBoundary'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { linkTelefone, linkWhatsapp } from '@/utils/contato'
import { mensagemErro } from '@/utils/errors'
import { formatDataHora } from '@/utils/format'
import { formatBRL, numeroPedido } from '@/utils/money'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'

export function ClienteDialog({
  id,
  modo,
  aberto,
  onOpenChange,
  onModo,
  onAbrirPedido,
}: {
  id: string
  modo: ModoPainel
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  onModo: (modo: ModoPainel) => void
  onAbrirPedido: (id: string) => void
}) {
  const { abrir } = useNovoPedido()
  const cliente = useCliente(aberto ? id : '')
  const pedidos = usePedidosDoCliente(aberto ? id : '')
  const dados = cliente.data
  const total = (pedidos.data ?? []).reduce((soma, pedido) => soma + pedido.valor_total, 0)

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
            <div className="space-y-4 text-sm">
              <p className="break-words">
                <span className="text-muted-foreground">Telefone: </span>
                {dados.telefone}
              </p>
              <p className="break-words">
                <span className="text-muted-foreground">E-mail: </span>
                {dados.email || '—'}
              </p>
              <p className="break-words">
                <span className="text-muted-foreground">Endereço: </span>
                {dados.endereco}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <a href={linkTelefone(dados.telefone)}>Ligar</a>
                </Button>
                <Button asChild variant="outline">
                  <a href={linkWhatsapp(dados.telefone)} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </Button>
                <Button type="button" onClick={() => abrir(id)}>
                  Novo pedido
                  <CirclePlus data-icon="inline-end" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <p>
                  <span className="block text-muted-foreground">Pedidos</span>
                  <span className="text-2xl font-semibold tabular-nums">{pedidos.data?.length ?? 0}</span>
                </p>
                <p>
                  <span className="block text-muted-foreground">Valor somado</span>
                  <span className="text-2xl font-semibold tabular-nums">{formatBRL(total)}</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Pedidos deste cliente</p>
                <QueryBoundary isLoading={pedidos.isLoading} error={pedidos.error} onRetry={() => void pedidos.refetch()}>
                  {pedidos.data && pedidos.data.length > 0 ? (
                    <ul className="space-y-2">
                      {pedidos.data.map((pedido) => (
                        <li key={pedido.id}>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left"
                            onClick={() => onAbrirPedido(pedido.id)}
                          >
                            <span>
                              <span className="block font-medium">{numeroPedido(pedido.numero)}</span>
                              <span className="text-xs text-muted-foreground">{formatDataHora(pedido.created_at)}</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <StatusBadge status={pedido.status} />
                              <span className="tabular-nums">{formatBRL(pedido.valor_total)}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState title="Este cliente ainda não tem pedidos" />
                  )}
                </QueryBoundary>
              </div>
              <div className="flex justify-end">
                <Button type="button" size="icon" aria-label="Editar" onClick={() => onModo('editar')}>
                  <Pencil />
                </Button>
              </div>
            </div>
          ) : null}
        </QueryBoundary>
      </DialogContent>
    </Dialog>
  )
}

function EditarClienteForm({
  id,
  valores,
  onSaved,
}: {
  id: string
  valores: ClienteFormValues
  onSaved: () => void
}) {
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    values: valores,
  })
  const mutation = useAtualizarCliente(id)

  return (
    <form
      className="grid gap-3"
      onSubmit={form.handleSubmit((dados) =>
        mutation.mutate(dados, {
          onSuccess: onSaved,
          onError: (error) => toast.error(mensagemErro(error)),
        }),
      )}
    >
      <Field label="Nome" htmlFor="editar-cliente-nome" error={form.formState.errors.nome?.message}>
        <Input id="editar-cliente-nome" {...form.register('nome')} />
      </Field>
      <Field label="Telefone" htmlFor="editar-cliente-telefone" error={form.formState.errors.telefone?.message}>
        <Input id="editar-cliente-telefone" {...form.register('telefone')} />
      </Field>
      <Field label="E-mail" htmlFor="editar-cliente-email" error={form.formState.errors.email?.message}>
        <Input id="editar-cliente-email" type="email" {...form.register('email')} />
      </Field>
      <Field label="Endereço da instalação" htmlFor="editar-cliente-endereco" error={form.formState.errors.endereco?.message}>
        <Input id="editar-cliente-endereco" {...form.register('endereco')} />
      </Field>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Salvando...' : 'Salvar cliente'}
      </Button>
    </form>
  )
}
