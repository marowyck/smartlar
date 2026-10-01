import { CirclePlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { NovoProdutoDialog } from '@/features/produtos/components/NovoProdutoDialog'
import { ProdutosList } from '@/features/produtos/components/ProdutosList'
import { ordenarCategorias } from '@/features/produtos/constants'
import { useProdutos } from '@/features/produtos/hooks/useProdutos'
import { usePainel } from '@/store/painel-context'
import { cn } from '@/utils/cn'

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
      <ProdutosList
        categorias={categorias}
        produtos={visiveis}
        isLoading={produtos.isLoading}
        error={produtos.error}
        onRetry={() => void produtos.refetch()}
        onAbrir={abrirProduto}
      />
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
