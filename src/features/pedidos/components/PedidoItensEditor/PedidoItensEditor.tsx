import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { Button } from '@/components/ui/button'
import { calcularTotal } from '@/features/pedidos/domain/calculos'
import { planejarAlteracaoItens, precoParaEdicao, type ItemSalvo } from '@/features/pedidos/domain/itens'
import { ItemPedidoRow } from '@/features/pedidos/components/ItemPedidoRow'
import { useSalvarItens } from '@/features/pedidos/hooks/useSalvarItens'
import { pedidoSchema, type PedidoFormValues } from '@/features/pedidos/schemas'
import type { PedidoDetalhe } from '@/features/pedidos/types'
import { useProdutos } from '@/features/produtos/hooks/useProdutos'
import type { Produto } from '@/features/produtos/types'
import { mensagemErro } from '@/utils/errors'
import { formatBRL } from '@/utils/money'

function salvosDe(pedido: PedidoDetalhe): ItemSalvo[] {
  return pedido.itens_pedido.map((item) => ({
    id: item.id,
    produtoId: item.produto_id,
    quantidade: item.quantidade,
    precoUnitario: item.preco_unitario,
  }))
}

function catalogoDe(produtos: Produto[], pedido: PedidoDetalhe): Produto[] {
  const ativos = produtos.filter((produto) => produto.ativo)
  const ids = new Set(ativos.map((produto) => produto.id))
  const extras = pedido.itens_pedido.flatMap((item) => {
    if (ids.has(item.produto_id) || !item.produtos) return []
    return [
      {
        id: item.produto_id,
        nome: item.produtos.nome,
        categoria: item.produtos.categoria,
        preco_unitario: item.preco_unitario,
        descricao: null,
        ativo: false,
        created_at: '',
      } satisfies Produto,
    ]
  })
  return [...ativos, ...extras]
}

export function PedidoItensEditor({ pedido }: { pedido: PedidoDetalhe }) {
  const produtos = useProdutos()
  const salvar = useSalvarItens(pedido.id)
  const salvos = salvosDe(pedido)
  const form = useForm<PedidoFormValues>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      cliente_id: pedido.cliente_id,
      observacoes: pedido.observacoes ?? '',
      forma_pagamento: pedido.forma_pagamento ?? 'nenhuma',
      itens: pedido.itens_pedido.map((item) => ({
        id: item.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
      })),
    },
  })
  const linhas = useFieldArray({ control: form.control, name: 'itens' })
  const itens = useWatch({ control: form.control, name: 'itens' })
  const catalogo = catalogoDe(produtos.data ?? [], pedido)
  const desejados = (itens ?? []).map((item) => ({
    id: item.id,
    produtoId: item.produto_id,
    quantidade: Number(item.quantidade) || 0,
  }))
  const plano = planejarAlteracaoItens(salvos, desejados)
  const semMudanca = plano.atualizar.length + plano.inserir.length + plano.excluir.length === 0
  const total = calcularTotal(
    desejados.map((item) => ({
      quantidade: item.quantidade,
      precoUnitario: precoParaEdicao(
        item,
        salvos,
        catalogo.find((produto) => produto.id === item.produtoId)?.preco_unitario ?? 0,
      ),
    })),
  )

  function enviar(values: PedidoFormValues) {
    const proximo = planejarAlteracaoItens(
      salvos,
      values.itens.map((item) => ({
        id: item.id,
        produtoId: item.produto_id,
        quantidade: item.quantidade,
      })),
    )
    if (proximo.atualizar.length + proximo.inserir.length + proximo.excluir.length === 0) return
    salvar.mutate(proximo, {
      onSuccess: () => toast.success('Itens atualizados'),
      onError: (error) => toast.error(mensagemErro(error)),
    })
  }

  return (
    <QueryBoundary isLoading={produtos.isLoading} error={produtos.error} onRetry={() => void produtos.refetch()}>
      <form className="space-y-3" onSubmit={form.handleSubmit(enviar)}>
        {linhas.fields.map((field, index) => {
          const produtoId = itens?.[index]?.produto_id ?? ''
          const quantidade = Number(itens?.[index]?.quantidade) || 0
          const preco = precoParaEdicao(
            { id: itens?.[index]?.id, produtoId },
            salvos,
            catalogo.find((produto) => produto.id === produtoId)?.preco_unitario ?? 0,
          )
          return (
            <ItemPedidoRow
              key={field.id}
              index={index}
              control={form.control}
              errors={form.formState.errors}
              produtos={catalogo.filter((produto) => produto.ativo || produto.id === produtoId)}
              produtoId={produtoId}
              quantidade={quantidade}
              precoUnitario={preco}
              podeRemover={linhas.fields.length > 1}
              onQuantidade={(valor) => form.setValue(`itens.${index}.quantidade`, valor, { shouldValidate: true })}
              onRemover={() => linhas.remove(index)}
            />
          )
        })}
        {form.formState.errors.itens?.message ? (
          <p className="text-sm text-destructive">{form.formState.errors.itens.message}</p>
        ) : null}
        {form.formState.errors.itens?.root?.message ? (
          <p className="text-sm text-destructive">{form.formState.errors.itens.root.message}</p>
        ) : null}
        <Button type="button" variant="outline" onClick={() => linhas.append({ produto_id: '', quantidade: 1 })}>
          Adicionar produto
        </Button>
        <p className="text-sm text-muted-foreground">
          Trocar o produto usa o preço atual do catálogo. Mudar só a quantidade mantém o preço deste orçamento.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg font-semibold tabular-nums">Total {formatBRL(total)}</p>
          <Button type="submit" disabled={salvar.isPending || semMudanca}>
            {salvar.isPending ? 'Salvando...' : 'Salvar itens'}
          </Button>
        </div>
      </form>
    </QueryBoundary>
  )
}
