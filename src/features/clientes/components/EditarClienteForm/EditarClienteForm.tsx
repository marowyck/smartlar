import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field } from '@/components/common/Field'
import { clienteSchema, type ClienteFormValues } from '@/features/clientes/schemas'
import { useAtualizarCliente } from '@/features/clientes/hooks/useClientes'
import { mensagemErro } from '@/utils/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function EditarClienteForm({
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
