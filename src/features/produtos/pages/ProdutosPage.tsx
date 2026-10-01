import { CirclePlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { NovoProdutoDialog } from '@/features/produtos/components/NovoProdutoDialog'
import { usePainel } from '@/store/painel-context'
import { RecordActions } from '@/components/common/RecordActions'
import { ordenarCategorias } from '@/features/produtos/constants'
import { useProdutos } from '@/features/produtos/hooks/useProdutos'
import { EmptyState } from '@/components/common/EmptyState'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { cn } from '@/utils/cn'
import { formatBRL } from '@/utils/money'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProdutosPage() {
  const { abrirProduto } = usePainel()
  const [aberto, setAberto] = useState(false)
  const [categoria, setCategoria] = useState('todas')
  const produtos = useProdutos()
  const categorias = useMemo(() => ordenarCategorias((produtos.data ?? []).map((produto) => produto.categoria)), [produtos.data])
  const visiveis = (produtos.data ?? []).filter((produto) => categoria === 'todas' || produto.categoria === categoria)

  return (
    <PageContainer>
      <PageHeader
        title="Produtos"
        description="Catálogo usado nos orçamentos. Mudar o preço não altera pedidos já salvos."
        action={
          <Button
            onClick={() => {
              setAberto(true)
              toast.dismiss()
            }}
          >
            Novo produto
            <CirclePlus data-icon="inline-end" />
          </Button>
        }
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip ativo={categoria === 'todas'} onClick={() => setCategoria('todas')}>
          Todas
        </Chip>
        {categorias.map((nome) => (
          <Chip key={nome} ativo={categoria === nome} onClick={() => setCategoria(nome)}>
            {nome}
          </Chip>
        ))}
      </div>
      <QueryBoundary isLoading={produtos.isLoading} error={produtos.error} onRetry={() => void produtos.refetch()}>
        {visiveis.length === 0 ? (
          <EmptyState title="Nenhum produto encontrado" />
        ) : (
          <div className="space-y-8">
            {categorias.map((nome) => {
              const itens = visiveis.filter((produto) => produto.categoria === nome)
              if (itens.length === 0) return null
              return (
                <section key={nome} className="space-y-3">
                  <h2 className="text-lg font-semibold">{nome}</h2>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {itens.map((produto) => (
                      <Card key={produto.id} variant="interactive" onClick={() => abrirProduto(produto.id, 'ver')}>
                        <CardHeader>
                          <CardTitle className="flex items-start justify-between gap-3">
                            <span className="text-balance">{produto.nome}</span>
                            <span className="whitespace-nowrap text-base tabular-nums">{formatBRL(produto.preco_unitario)}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-end justify-between gap-3">
                          <p className="text-sm text-muted-foreground">{produto.descricao || 'Sem descrição'}</p>
                          <RecordActions onVer={() => abrirProduto(produto.id, 'ver')} onEditar={() => abrirProduto(produto.id, 'editar')} />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </QueryBoundary>
      <NovoProdutoDialog aberto={aberto} categorias={categorias} onOpenChange={setAberto} />
    </PageContainer>
  )
}

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1.5 text-sm',
        ativo ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground',
      )}
    >
      {children}
    </button>
  )
}
