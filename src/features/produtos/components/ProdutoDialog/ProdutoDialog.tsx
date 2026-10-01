import { toast } from 'sonner'
import { ProdutoForm } from '@/features/produtos/components/ProdutoForm'
import { ProdutoView } from '@/features/produtos/components/ProdutoView'
import { ordenarCategorias } from '@/features/produtos/constants'
import { useAtualizarProduto, useProdutos } from '@/features/produtos/hooks/useProdutos'
import { mensagemErro } from '@/utils/errors'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ProdutoDialogProps } from './ProdutoDialog.types'

export function ProdutoDialog({ id, modo, aberto, onOpenChange, onModo }: ProdutoDialogProps) {
  const produtos = useProdutos(aberto)
  const produto = produtos.data?.find((item) => item.id === id)
  const categorias = ordenarCategorias((produtos.data ?? []).map((item) => item.categoria))
  const atualizar = useAtualizarProduto()

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
        {produto && modo === 'ver' ? <ProdutoView produto={produto} onEditar={() => onModo('editar')} /> : null}
        {produto && modo === 'editar' ? (
          <ProdutoForm
            idPrefix="editar-produto"
            categorias={categorias}
            valores={{
              nome: produto.nome,
              categoria: produto.categoria,
              preco_unitario: produto.preco_unitario,
              descricao: produto.descricao ?? '',
            }}
            submitLabel="Salvar produto"
            pendente={atualizar.isPending}
            erro={atualizar.error ? mensagemErro(atualizar.error) : undefined}
            onSubmit={(dados) =>
              atualizar.mutate(
                { id: produto.id, input: dados },
                {
                  onSuccess: () => {
                    toast.success('Produto atualizado')
                    onModo('ver')
                  },
                },
              )
            }
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
