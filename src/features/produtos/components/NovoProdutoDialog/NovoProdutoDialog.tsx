import { toast } from 'sonner'
import { ProdutoForm } from '@/features/produtos/components/ProdutoForm'
import { useCriarProduto } from '@/features/produtos/hooks/useProdutos'
import { mensagemErro } from '@/utils/errors'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function NovoProdutoDialog({
  aberto,
  categorias,
  onOpenChange,
}: {
  aberto: boolean
  categorias: string[]
  onOpenChange: (aberto: boolean) => void
}) {
  const mutation = useCriarProduto()

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo produto</DialogTitle>
          <DialogDescription>Use uma das categorias existentes ou crie outra.</DialogDescription>
        </DialogHeader>
        {aberto ? (
          <ProdutoForm
            idPrefix="produto"
            categorias={categorias}
            valores={{ nome: '', categoria: '', preco_unitario: 0, descricao: '' }}
            submitLabel="Cadastrar"
            pendente={mutation.isPending}
            erro={mutation.error ? mensagemErro(mutation.error) : undefined}
            onSubmit={(values) =>
              mutation.mutate(values, {
                onSuccess: () => {
                  toast.success('Produto cadastrado')
                  onOpenChange(false)
                },
              })
            }
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
