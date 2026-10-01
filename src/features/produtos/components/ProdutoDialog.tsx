import { Pencil } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ordenarCategorias } from '@/features/produtos/constants'
import { useAtualizarProduto, useProdutos } from '@/features/produtos/hooks/useProdutos'
import type { NovoProdutoInput } from '@/features/produtos/types'
import type { ModoPainel } from '@/app/layouts/painel-context'
import { Field } from '@/shared/components/Field'
import { mensagemErro } from '@/utils/errors'
import { formatBRL } from '@/utils/money'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

const schema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome'),
  categoria: z.string().trim().min(1, 'Informe a categoria'),
  preco_unitario: z.number().positive('O preço precisa ser maior que zero'),
  descricao: z.string(),
})

export function ProdutoDialog({
  id,
  modo,
  aberto,
  onOpenChange,
  onModo,
}: {
  id: string
  modo: ModoPainel
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  onModo: (modo: ModoPainel) => void
}) {
  const produtos = useProdutos(aberto)
  const produto = produtos.data?.find((item) => item.id === id)
  const categorias = ordenarCategorias((produtos.data ?? []).map((item) => item.categoria))

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{modo === 'editar' ? 'Editar produto' : (produto?.nome ?? 'Produto')}</DialogTitle>
          <DialogDescription>
            {modo === 'editar'
              ? 'Pedidos já criados continuam com o preço da época.'
              : 'Preço e descrição do catálogo.'}
          </DialogDescription>
        </DialogHeader>
        {modo === 'editar' ? (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onModo('ver')}>
              Visualizar
            </Button>
          </div>
        ) : null}
        {produto && modo === 'ver' ? (
          <div className="space-y-4 text-sm">
            <p>
              <span className="text-muted-foreground">Categoria: </span>
              {produto.categoria}
            </p>
            <p className="text-2xl font-semibold tabular-nums">{formatBRL(produto.preco_unitario)}</p>
            <p className="text-muted-foreground">{produto.descricao || 'Sem descrição'}</p>
            <div className="flex justify-end">
              <Button type="button" size="icon" aria-label="Editar" onClick={() => onModo('editar')}>
                <Pencil />
              </Button>
            </div>
          </div>
        ) : null}
        {produto && modo === 'editar' ? (
          <EditarProdutoForm
            id={produto.id}
            categorias={categorias}
            valores={{
              nome: produto.nome,
              categoria: produto.categoria,
              preco_unitario: produto.preco_unitario,
              descricao: produto.descricao ?? '',
            }}
            onSaved={() => {
              toast.success('Produto atualizado')
              onModo('ver')
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function EditarProdutoForm({
  id,
  categorias,
  valores,
  onSaved,
}: {
  id: string
  categorias: string[]
  valores: NovoProdutoInput
  onSaved: () => void
}) {
  const form = useForm<NovoProdutoInput>({
    resolver: zodResolver(schema),
    values: valores,
  })
  const mutation = useAtualizarProduto()

  return (
    <form
      className="grid gap-3"
      onSubmit={form.handleSubmit((dados) =>
        mutation.mutate(
          { id, input: dados },
          {
            onSuccess: onSaved,
            onError: (error) => toast.error(mensagemErro(error)),
          },
        ),
      )}
    >
      <Field label="Nome" htmlFor="editar-produto-nome" error={form.formState.errors.nome?.message}>
        <Input id="editar-produto-nome" {...form.register('nome')} />
      </Field>
      <Field label="Categoria" htmlFor="editar-produto-categoria" error={form.formState.errors.categoria?.message}>
        <Input id="editar-produto-categoria" {...form.register('categoria')} list="editar-categorias-produto" />
        <datalist id="editar-categorias-produto">
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria} />
          ))}
        </datalist>
      </Field>
      <Field label="Preço unitário" htmlFor="editar-produto-preco" error={form.formState.errors.preco_unitario?.message}>
        <Input id="editar-produto-preco" type="number" step="0.01" min="0.01" {...form.register('preco_unitario', { valueAsNumber: true })} />
      </Field>
      <Field label="Descrição" htmlFor="editar-produto-descricao">
        <Textarea id="editar-produto-descricao" {...form.register('descricao')} />
      </Field>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Salvando...' : 'Salvar produto'}
      </Button>
    </form>
  )
}
