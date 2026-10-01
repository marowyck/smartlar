import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Field } from '@/components/common/Field'
import { produtoSchema, type ProdutoFormValues } from '@/features/produtos/schemas/produto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function ProdutoForm({
  idPrefix,
  categorias,
  valores,
  submitLabel,
  pendente,
  erro,
  onSubmit,
}: {
  idPrefix: string
  categorias: string[]
  valores: ProdutoFormValues
  submitLabel: string
  pendente: boolean
  erro?: string
  onSubmit: (valores: ProdutoFormValues) => void
}) {
  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    values: valores,
  })

  return (
    <form className="grid gap-3" onSubmit={form.handleSubmit((dados) => onSubmit(dados))}>
      <Field label="Nome" htmlFor={`${idPrefix}-nome`} error={form.formState.errors.nome?.message}>
        <Input id={`${idPrefix}-nome`} {...form.register('nome')} />
      </Field>
      <Field label="Categoria" htmlFor={`${idPrefix}-categoria`} error={form.formState.errors.categoria?.message}>
        <Input id={`${idPrefix}-categoria`} {...form.register('categoria')} list={`${idPrefix}-categorias`} />
        <datalist id={`${idPrefix}-categorias`}>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria} />
          ))}
        </datalist>
      </Field>
      <Field label="Preço unitário" htmlFor={`${idPrefix}-preco`} error={form.formState.errors.preco_unitario?.message}>
        <Input id={`${idPrefix}-preco`} type="number" step="0.01" min="0.01" {...form.register('preco_unitario', { valueAsNumber: true })} />
      </Field>
      <Field label="Descrição" htmlFor={`${idPrefix}-descricao`}>
        <Textarea id={`${idPrefix}-descricao`} {...form.register('descricao')} />
      </Field>
      {erro ? <p className="text-sm text-destructive">{erro}</p> : null}
      <Button type="submit" disabled={pendente}>
        {pendente ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  )
}
