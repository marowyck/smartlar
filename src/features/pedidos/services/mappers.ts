import type { Cliente } from '@/features/clientes/types'
import type {
  HistoricoStatus,
  ItemPedido,
  PedidoDetalhe,
  PedidoResumo,
} from '@/features/pedidos/types'
import { isStatusPedido } from '@/features/pedidos/domain/status'
import { isFormaPagamento, toNumber } from '@/shared/lib/money'
import { um } from '@/shared/lib/result'

export function mapResumo(row: PedidoResumo): PedidoResumo {
  return {
    ...row,
    numero: toNumber(row.numero),
    valor_total: toNumber(row.valor_total),
    forma_pagamento: isFormaPagamento(row.forma_pagamento) ? row.forma_pagamento : null,
    status: row.status,
  }
}

type LinhaPedido = PedidoDetalhe & {
  valor_total: number | string
  clientes: Cliente | Cliente[] | null
  tecnicos: PedidoDetalhe['tecnicos'] | NonNullable<PedidoDetalhe['tecnicos']>[] | null
  itens_pedido: ItemPedido[] | null
  historico_status: HistoricoStatus[] | null
}

export function mapPedido(row: LinhaPedido): PedidoDetalhe {
  if (!isStatusPedido(row.status)) {
    throw new Error(`Status desconhecido: ${row.status}`)
  }

  const itens = (row.itens_pedido ?? []).map((item) => ({
    ...item,
    produtos: um(item.produtos),
    quantidade: toNumber(item.quantidade),
    preco_unitario: toNumber(item.preco_unitario),
    subtotal: toNumber(item.subtotal),
  }))

  const historico = [...(row.historico_status ?? [])].sort((a, b) =>
    a.alterado_em.localeCompare(b.alterado_em),
  )

  return {
    ...row,
    numero: toNumber(row.numero),
    valor_total: toNumber(row.valor_total),
    forma_pagamento: isFormaPagamento(row.forma_pagamento) ? row.forma_pagamento : null,
    clientes: um(row.clientes),
    tecnicos: um(row.tecnicos),
    itens_pedido: itens,
    historico_status: historico,
  }
}
