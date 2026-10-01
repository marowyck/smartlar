import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { clienteSchema, type ClienteFormValues } from '@/features/clientes/schemas'
import { useCriarCliente } from '@/features/clientes/hooks/useClientes'
import type { Cliente } from '@/features/clientes/types'
import { Field } from '@/shared/components/Field'
import { mensagemErro } from '@/utils/errors'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export function ClienteForm({
  onCreated,
  submitLabel = 'Cadastrar cliente',
}: {
  onCreated: (cliente: Cliente) => void
  submitLabel?: string
}) {
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { nome: '', telefone: '', email: '', endereco: '' },
  })
  const mutation = useCriarCliente()

  return (
    <form
      className="grid gap-3"
      onSubmit={form.handleSubmit((values) =>
        mutation.mutate(values, {
          onSuccess: (cliente) => {
            form.reset()
            onCreated(cliente)
          },
        }),
      )}
    >
      <Field label="Nome" htmlFor="cliente-nome" error={form.formState.errors.nome?.message}>
        <Input id="cliente-nome" {...form.register('nome')} placeholder="Nome do cliente" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Telefone" htmlFor="cliente-telefone" error={form.formState.errors.telefone?.message}>
          <Input id="cliente-telefone" {...form.register('telefone')} placeholder="(11) 98888-0000" />
        </Field>
        <Field label="E-mail" htmlFor="cliente-email" error={form.formState.errors.email?.message}>
          <Input id="cliente-email" type="email" {...form.register('email')} placeholder="opcional" />
        </Field>
      </div>
      <Field label="Endereço da instalação" htmlFor="cliente-endereco" error={form.formState.errors.endereco?.message}>
        <Input id="cliente-endereco" {...form.register('endereco')} placeholder="Rua, número, bairro, cidade" />
      </Field>
      {mutation.error ? <p className="text-sm text-destructive">{mensagemErro(mutation.error)}</p> : null}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  )
}
