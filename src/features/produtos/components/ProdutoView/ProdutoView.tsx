import { Pencil } from 'lucide-react'
import type { Produto } from '@/features/produtos/types'
import { formatBRL } from '@/utils/money'
import { Button } from '@/components/ui/button'

export function ProdutoView({ produto, onEditar }: { produto: Produto; onEditar: () => void }) {
  return (
    <div className="space-y-4 text-sm">
      <p>
        <span className="text-muted-foreground">Categoria: </span>
        {produto.categoria}
      </p>
      <p className="text-2xl font-semibold tabular-nums">{formatBRL(produto.preco_unitario)}</p>
      <p className="text-muted-foreground">{produto.descricao || 'Sem descrição'}</p>
      <div className="flex justify-end">
        <Button type="button" size="icon" aria-label="Editar" onClick={onEditar}>
          <Pencil />
        </Button>
      </div>
    </div>
  )
}
