import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useCriarProduto } from '@/features/produtos/hooks/useProdutos'
import { Field } from '@/shared/components/Field'
import { mensagemErro } from '@/utils/errors'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

const schema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome'),
  categoria: z.string().trim().min(1, 'Informe a categoria'),
  preco_unitario: z.number().positive('O preço precisa ser maior que zero'),
  descricao: z.string(),
})

type FormValues = z.infer<typeof schema>

export function NovoProdutoDialog({
  aberto,
  categorias,
  onOpenChange,
}: {
  aberto: boolean
  categorias: string[]
  onOpenChange: (aberto: boolean) => void
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', categoria: '', preco_unitario: 0, descricao: '' },
  })
  const mutation = useCriarProduto()

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo produto</DialogTitle>
          <DialogDescription>Use uma das categorias existentes ou crie outra.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={form.handleSubmit((values) =>
            mutation.mutate(values, {
              onSuccess: () => {
                form.reset()
                toast.success('Produto cadastrado')
                onOpenChange(false)
              },
            }),
          )}
        >
          <Field label="Nome" htmlFor="produto-nome" error={form.formState.errors.nome?.message}>
            <Input id="produto-nome" {...form.register('nome')} />
          </Field>
          <Field label="Categoria" htmlFor="produto-categoria" error={form.formState.errors.categoria?.message}>
            <Input id="produto-categoria" {...form.register('categoria')} list="categorias-produto" />
            <datalist id="categorias-produto">
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria} />
              ))}
            </datalist>
          </Field>
          <Field label="Preço unitário" htmlFor="produto-preco" error={form.formState.errors.preco_unitario?.message}>
            <Input id="produto-preco" type="number" step="0.01" min="0.01" {...form.register('preco_unitario', { valueAsNumber: true })} />
          </Field>
          <Field label="Descrição" htmlFor="produto-descricao">
            <Textarea id="produto-descricao" {...form.register('descricao')} />
          </Field>
          {mutation.error ? <p className="text-sm text-destructive">{mensagemErro(mutation.error)}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
