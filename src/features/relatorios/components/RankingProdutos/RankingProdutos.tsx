import type { ProdutoVendido } from '@/features/relatorios/types'
import { formatBRL } from '@/utils/money'

export function RankingProdutos({ produtos }: { produtos: ProdutoVendido[] }) {
  const maior = Math.max(...produtos.map((produto) => produto.receita), 1)

  return (
    <ol className="space-y-3">
      {produtos.map((produto, index) => (
        <li key={produto.id} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span>
              <span className="text-muted-foreground">{index + 1}. </span>
              {produto.nome}
              <span className="text-muted-foreground"> · {produto.categoria}</span>
            </span>
            <span className="shrink-0 tabular-nums">{formatBRL(produto.receita)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(produto.receita / maior) * 100}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{produto.quantidade} un. vendidas</p>
        </li>
      ))}
    </ol>
  )
}
