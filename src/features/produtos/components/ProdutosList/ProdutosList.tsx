import { EmptyState } from '@/components/common/EmptyState'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { RecordActions } from '@/components/common/RecordActions'
import type { Produto } from '@/features/produtos/types'
import type { ModoPainel } from '@/store/painel-context'
import { formatBRL } from '@/utils/money'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProdutosList({
  categorias,
  produtos,
  isLoading,
  error,
  onRetry,
  onAbrir,
}: {
  categorias: string[]
  produtos: Produto[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
  onAbrir: (id: string, modo: ModoPainel) => void
}) {
  return (
    <QueryBoundary isLoading={isLoading} error={error} onRetry={onRetry}>
      {produtos.length === 0 ? (
        <EmptyState title="Nenhum produto encontrado" />
      ) : (
        <div className="space-y-8">
          {categorias.map((nome) => {
            const itens = produtos.filter((produto) => produto.categoria === nome)
            if (itens.length === 0) return null
            return (
              <section key={nome} className="space-y-3">
                <h2 className="text-lg font-semibold">{nome}</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {itens.map((produto) => (
                    <Card key={produto.id} variant="interactive" onClick={() => onAbrir(produto.id, 'ver')}>
                      <CardHeader>
                        <CardTitle className="flex items-start justify-between gap-3">
                          <span className="text-balance">{produto.nome}</span>
                          <span className="whitespace-nowrap text-base tabular-nums">{formatBRL(produto.preco_unitario)}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-end justify-between gap-3">
                        <p className="text-sm text-muted-foreground">{produto.descricao || 'Sem descrição'}</p>
                        <RecordActions onVer={() => onAbrir(produto.id, 'ver')} onEditar={() => onAbrir(produto.id, 'editar')} />
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
  )
}
