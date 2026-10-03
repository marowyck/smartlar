import { listarPedidos } from '@/features/pedidos/services/pedidos'
import { STATUS_LABEL } from '@/features/pedidos/domain/status'
import { labelFormaPagamento } from '@/utils/money'

function celula(valor: string | number) {
  const texto = String(valor).replaceAll('"', '""')
  return `"${texto}"`
}

export async function baixarPedidosCsv() {
  const pedidos = await listarPedidos()
  const linhas = [
    ['numero', 'cliente', 'telefone', 'status', 'total', 'desconto', 'pagamento', 'tecnico', 'criado'],
    ...pedidos.map((pedido) => [
      pedido.numero,
      pedido.cliente_nome,
      pedido.cliente_telefone,
      STATUS_LABEL[pedido.status],
      pedido.valor_total.toFixed(2),
      pedido.desconto.toFixed(2),
      labelFormaPagamento(pedido.forma_pagamento),
      pedido.tecnico_nome ?? '',
      pedido.created_at,
    ]),
  ]
  const csv = linhas.map((linha) => linha.map(celula).join(';')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pedidos-smartlar.csv'
  link.click()
  URL.revokeObjectURL(url)
}
