import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import type { ReactNode } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { criarCliente } from '@/lib/api'
import { mensagemErro } from '@/lib/errors'
import type { Cliente } from '@/lib/types'

const schema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome'),
  telefone: z.string().trim().min(1, 'Telefone é obrigatório (WhatsApp)'),
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().email().safeParse(value).success, 'E-mail inválido'),
  endereco: z.string().trim().min(1, 'Informe o endereço da instalação'),
})

type FormValues = z.infer<typeof schema>

export function ClienteForm({
  onCreated,
  submitLabel = 'Cadastrar cliente',
}: {
  onCreated: (cliente: Cliente) => void
  submitLabel?: string
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', telefone: '', email: '', endereco: '' },
  })

  const mutation = useMutation({
    mutationFn: criarCliente,
    onSuccess: (cliente) => {
      form.reset()
      onCreated(cliente)
    },
  })

  return (
    <form
      className="grid gap-3"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <Campo label="Nome" error={form.formState.errors.nome?.message}>
        <Input {...form.register('nome')} placeholder="Nome do cliente" />
      </Campo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo label="Telefone" error={form.formState.errors.telefone?.message}>
          <Input {...form.register('telefone')} placeholder="(11) 98888-0000" />
        </Campo>
        <Campo label="E-mail" error={form.formState.errors.email?.message}>
          <Input {...form.register('email')} type="email" placeholder="opcional" />
        </Campo>
      </div>
      <Campo label="Endereço da instalação" error={form.formState.errors.endereco?.message}>
        <Input {...form.register('endereco')} placeholder="Rua, número, bairro, cidade" />
      </Campo>
      {mutation.error ? <p className="text-sm text-destructive">{mensagemErro(mutation.error)}</p> : null}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  )
}

function Campo({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
