import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { EmptyState, PageHeader, QueryState } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { atualizarPreco, criarProduto, listarProdutos } from '@/lib/api'
import { mensagemErro } from '@/lib/errors'
import { formatBRL } from '@/lib/money'
import type { Produto } from '@/lib/types'

const schemaProduto = z.object({
  nome: z.string().trim().min(1, 'Informe o nome'),
  categoria: z.string().trim().min(1, 'Informe a categoria'),
  preco_unitario: z.number().positive('O preço precisa ser maior que zero'),
  descricao: z.string(),
})

const schemaPreco = z.object({
  preco_unitario: z.number().positive('O preço precisa ser maior que zero'),
})

type ProdutoForm = z.infer<typeof schemaProduto>
type PrecoForm = z.infer<typeof schemaPreco>

const ordemCategorias = ['Segurança', 'Iluminação', 'Automação']

export function ProdutosPage() {
  const queryClient = useQueryClient()
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState<Produto | null>(null)
  const [filtro, setFiltro] = useState('')
  const produtos = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos })

  const categorias = useMemo(() => {
    const nomes = new Set((produtos.data ?? []).map((produto) => produto.categoria))
    return [...nomes].sort((a, b) => {
      const ia = ordemCategorias.indexOf(a)
      const ib = ordemCategorias.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b, 'pt-BR')
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  }, [produtos.data])

  const visiveis = (produtos.data ?? []).filter((produto) => {
    const termo = filtro.trim().toLowerCase()
    if (!termo) return true
    return (
      produto.nome.toLowerCase().includes(termo) ||
      produto.categoria.toLowerCase().includes(termo)
    )
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Catálogo usado nos orçamentos. Mudar o preço não altera pedidos já salvos."
        action={<Button onClick={() => setAberto(true)}>Novo produto</Button>}
      />
      <Input value={filtro} onChange={(event) => setFiltro(event.target.value)} placeholder="Filtrar por nome ou categoria" />
      <QueryState isLoading={produtos.isLoading} error={produtos.error}>
        {visiveis.length === 0 ? (
          <EmptyState>Nenhum produto encontrado.</EmptyState>
        ) : (
          <div className="space-y-6">
            {categorias.map((categoria) => {
              const itens = visiveis.filter((produto) => produto.categoria === categoria)
              if (itens.length === 0) return null
              return (
                <section key={categoria} className="space-y-3">
                  <h2 className="text-lg font-semibold">{categoria}</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {itens.map((produto) => (
                      <Card key={produto.id}>
                        <CardHeader>
                          <CardTitle className="flex items-start justify-between gap-3">
                            <span>{produto.nome}</span>
                            <span className="text-base">{formatBRL(produto.preco_unitario)}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-end justify-between gap-3">
                          <p className="text-sm text-muted-foreground">{produto.descricao || 'Sem descrição'}</p>
                          <Button variant="outline" onClick={() => setEditando(produto)}>
                            Editar preço
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </QueryState>

      <NovoProdutoDialog
        aberto={aberto}
        categorias={categorias}
        onOpenChange={setAberto}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: ['produtos'] })
          setAberto(false)
          toast.success('Produto cadastrado')
        }}
      />
      <EditarPrecoDialog
        produto={editando}
        onOpenChange={(abertoDialog) => {
          if (!abertoDialog) setEditando(null)
        }}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: ['produtos'] })
          setEditando(null)
          toast.success('Preço atualizado')
        }}
      />
    </div>
  )
}

function NovoProdutoDialog({
  aberto,
  categorias,
  onOpenChange,
  onSaved,
}: {
  aberto: boolean
  categorias: string[]
  onOpenChange: (aberto: boolean) => void
  onSaved: () => void
}) {
  const form = useForm<ProdutoForm>({
    resolver: zodResolver(schemaProduto),
    defaultValues: { nome: '', categoria: '', preco_unitario: 0, descricao: '' },
  })
  const mutation = useMutation({
    mutationFn: criarProduto,
    onSuccess: () => {
      form.reset()
      onSaved()
    },
  })

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo produto</DialogTitle>
          <DialogDescription>Use uma das categorias existentes ou crie outra.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="grid gap-1.5">
            <Label>Nome</Label>
            <Input {...form.register('nome')} />
            {form.formState.errors.nome ? <p className="text-xs text-destructive">{form.formState.errors.nome.message}</p> : null}
          </div>
          <div className="grid gap-1.5">
            <Label>Categoria</Label>
            <Input {...form.register('categoria')} list="categorias-produto" />
            <datalist id="categorias-produto">
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria} />
              ))}
            </datalist>
            {form.formState.errors.categoria ? <p className="text-xs text-destructive">{form.formState.errors.categoria.message}</p> : null}
          </div>
          <div className="grid gap-1.5">
            <Label>Preço unitário</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              {...form.register('preco_unitario', { valueAsNumber: true })}
            />
            {form.formState.errors.preco_unitario ? (
              <p className="text-xs text-destructive">{form.formState.errors.preco_unitario.message}</p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label>Descrição</Label>
            <Textarea {...form.register('descricao')} />
          </div>
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

function EditarPrecoDialog({
  produto,
  onOpenChange,
  onSaved,
}: {
  produto: Produto | null
  onOpenChange: (aberto: boolean) => void
  onSaved: () => void
}) {
  const form = useForm<PrecoForm>({
    resolver: zodResolver(schemaPreco),
    values: { preco_unitario: produto?.preco_unitario ?? 0 },
  })
  const mutation = useMutation({
    mutationFn: (preco: number) => atualizarPreco(produto!.id, preco),
    onSuccess: onSaved,
  })

  return (
    <Dialog open={produto != null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar preço</DialogTitle>
          <DialogDescription>
            {produto ? `${produto.nome}. Pedidos já criados continuam com o preço da época.` : null}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values.preco_unitario))}
        >
          <div className="grid gap-1.5">
            <Label>Preço unitário</Label>
            <Input type="number" step="0.01" min="0.01" {...form.register('preco_unitario', { valueAsNumber: true })} />
            {form.formState.errors.preco_unitario ? (
              <p className="text-xs text-destructive">{form.formState.errors.preco_unitario.message}</p>
            ) : null}
          </div>
          {mutation.error ? <p className="text-sm text-destructive">{mensagemErro(mutation.error)}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending || !produto}>
              Salvar preço
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
