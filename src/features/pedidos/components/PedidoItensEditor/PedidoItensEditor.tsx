import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { Button } from '@/components/ui/button'
import { aplicarDesconto, calcularTotal } from '@/features/pedidos/domain/calculos'
import { planejarAlteracaoItens, precoParaEdicao, type ItemSalvo } from '@/features/pedidos/domain/itens'
import { ItemPedidoRow } from '@/features/pedidos/components/ItemPedidoRow'
import { atualizarPedido, salvarItensPedido } from '@/features/pedidos/services/pedidos'
import { pedidoSchema, type PedidoFormValues } from '@/features/pedidos/schemas'
import type { PedidoDetalhe } from '@/features/pedidos/types'
import { useProdutos } from '@/features/produtos/hooks/useProdutos'
import type { Produto } from '@/features/produtos/types'
import { mensagemErro } from '@/utils/errors'
import { useInvalidateOperacao } from '@/hooks/useInvalidateOperacao'
import { formatBRL } from '@/utils/money'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  const invalidar = useInvalidateOperacao()
  const [salvando, setSalvando] = useState(false)
  const salvos = salvosDe(pedido)
  const form = useForm<PedidoFormValues>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      cliente_id: pedido.cliente_id,
      observacoes: pedido.observacoes ?? '',
      forma_pagamento: pedido.forma_pagamento ?? 'nenhuma',
      desconto: pedido.desconto,
      itens: pedido.itens_pedido.map((item) => ({
        id: item.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
      })),
    },
  })
  const linhas = useFieldArray({ control: form.control, name: 'itens' })
  const itens = useWatch({ control: form.control, name: 'itens' })
  const desconto = Number(useWatch({ control: form.control, name: 'desconto' })) || 0
  const descontoMudou = Math.abs(desconto - pedido.desconto) > 0.009
  const catalogo = catalogoDe(produtos.data ?? [], pedido)
  const desejados = (itens ?? []).map((item) => ({
    id: item.id,
    produtoId: item.produto_id,
    quantidade: Number(item.quantidade) || 0,
  }))
  const plano = planejarAlteracaoItens(salvos, desejados)
  const itensMudaram = plano.atualizar.length + plano.inserir.length + plano.excluir.length > 0
  const subtotal = calcularTotal(
    desejados.map((item) => ({
      quantidade: item.quantidade,
      precoUnitario: precoParaEdicao(
        item,
        salvos,
        catalogo.find((produto) => produto.id === item.produtoId)?.preco_unitario ?? 0,
      ),
    })),
  )
  const total = aplicarDesconto(subtotal, desconto)

  async function enviar(values: PedidoFormValues) {
    const proximo = planejarAlteracaoItens(
      salvos,
      values.itens.map((item) => ({
        id: item.id,
        produtoId: item.produto_id,
        quantidade: item.quantidade,
      })),
    )
    const mudaItens = proximo.atualizar.length + proximo.inserir.length + proximo.excluir.length > 0
    const mudaDesconto = Math.abs(values.desconto - pedido.desconto) > 0.009
    if (!mudaItens && !mudaDesconto) return
    setSalvando(true)
    try {
      if (mudaItens) await salvarItensPedido(pedido.id, proximo)
      if (mudaDesconto) await atualizarPedido(pedido.id, { desconto: values.desconto })
      await invalidar()
      toast.success('Orçamento atualizado')
    } catch (error) {
      toast.error(mensagemErro(error))
    } finally {
      setSalvando(false)
    }
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
        <div className="grid max-w-xs gap-1.5">
          <Label htmlFor="desconto-pedido">Desconto (R$)</Label>
          <Input id="desconto-pedido" type="number" step="0.01" min="0" {...form.register('desconto', { valueAsNumber: true })} />
          {form.formState.errors.desconto ? (
            <p className="text-xs text-destructive">{form.formState.errors.desconto.message}</p>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Trocar o produto usa o preço atual do catálogo. Mudar só a quantidade mantém o preço deste orçamento.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            {desconto > 0 ? (
              <p className="text-muted-foreground">
                Subtotal {formatBRL(subtotal)} − desconto {formatBRL(desconto)}
              </p>
            ) : null}
            <p className="text-lg font-semibold tabular-nums">Total {formatBRL(total)}</p>
          </div>
          <Button type="submit" disabled={salvando || (!itensMudaram && !descontoMudou)}>
            {salvando ? 'Salvando...' : 'Salvar orçamento'}
          </Button>
        </div>
      </form>
    </QueryBoundary>
  )
}
