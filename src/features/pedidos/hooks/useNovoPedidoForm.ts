import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { aplicarDesconto, calcularTotal } from '@/features/pedidos/domain/calculos'
import { useCriarPedido } from '@/features/pedidos/hooks/useCriarPedido'
import { pedidoSchema, type PedidoFormValues } from '@/features/pedidos/schemas'
import { useProdutos } from '@/features/produtos/hooks/useProdutos'
import { isFormaPagamento } from '@/utils/money'

export const PASSOS_NOVO_PEDIDO = ['Cliente', 'Itens', 'Resumo']

export function useNovoPedidoForm(clienteInicial: string | undefined, onCriado: () => void) {
  const [passo, setPasso] = useState(0)
  const [clienteAberto, setClienteAberto] = useState(false)
  const clientes = useClientes('')
  const produtos = useProdutos()
  const ativos = (produtos.data ?? []).filter((produto) => produto.ativo)
  const form = useForm<PedidoFormValues>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      cliente_id: clienteInicial ?? '',
      observacoes: '',
      forma_pagamento: 'nenhuma',
      desconto: 0,
      itens: [{ produto_id: '', quantidade: 1 }],
    },
  })
  const linhas = useFieldArray({ control: form.control, name: 'itens' })
  const itens = useWatch({ control: form.control, name: 'itens' })
  const clienteId = useWatch({ control: form.control, name: 'cliente_id' })
  const desconto = Number(useWatch({ control: form.control, name: 'desconto' })) || 0
  const cliente = clientes.data?.find((item) => item.id === clienteId)
  const subtotal = calcularTotal(
    (itens ?? []).map((item) => ({
      quantidade: Number(item.quantidade) || 0,
      precoUnitario: ativos.find((produto) => produto.id === item.produto_id)?.preco_unitario ?? 0,
    })),
  )
  const total = aplicarDesconto(subtotal, desconto)
  const mutation = useCriarPedido()

  async function avancar() {
    if (passo === 0) {
      if (await form.trigger('cliente_id')) setPasso(1)
      return
    }
    if (await form.trigger('itens')) setPasso(2)
  }

  function enviar(values: PedidoFormValues) {
    mutation.mutate(
      {
        cliente_id: values.cliente_id,
        observacoes: values.observacoes,
        forma_pagamento: isFormaPagamento(values.forma_pagamento) ? values.forma_pagamento : null,
        desconto: values.desconto,
        itens: values.itens.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        })),
      },
      {
        onSuccess: () => {
          toast.success('Orçamento salvo')
          onCriado()
        },
      },
    )
  }

  return {
    passo,
    setPasso,
    clienteAberto,
    setClienteAberto,
    clientes,
    ativos,
    form,
    linhas,
    itens,
    clienteId,
    cliente,
    subtotal,
    desconto,
    total,
    mutation,
    avancar,
    enviar,
  }
}
