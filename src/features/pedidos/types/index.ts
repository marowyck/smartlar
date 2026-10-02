import type { Tecnico } from '@/features/agenda/types'
import type { Cliente } from '@/features/clientes/types'
import type { FormaPagamento } from '@/utils/money'
import type { StatusPedido } from '@/features/pedidos/domain/status'

export type Pedido = {
  id: string
  numero: number
  cliente_id: string
  tecnico_id: string | null
  status: StatusPedido
  data_instalacao: string | null
  valor_total: number
  forma_pagamento: FormaPagamento | null
  observacoes: string | null
  created_at: string
  updated_at: string
  concluido_em: string | null
}

export type PedidoResumo = {
  id: string
  numero: number
  cliente_id: string
  tecnico_id: string | null
  status: StatusPedido
  data_instalacao: string | null
  valor_total: number
  forma_pagamento: FormaPagamento | null
  observacoes: string | null
  created_at: string
  cliente_nome: string
  cliente_telefone: string
  cliente_endereco: string
  tecnico_nome: string | null
}

export type ItemPedido = {
  id: string
  produto_id: string
  quantidade: number
  preco_unitario: number
  subtotal: number
  produtos: { id: string; nome: string; categoria: string } | null
}

export type HistoricoStatus = {
  id: string
  status_anterior: StatusPedido | null
  status_novo: StatusPedido
  alterado_em: string
}

export type PedidoDetalhe = Pedido & {
  clientes: Cliente | null
  tecnicos: Pick<Tecnico, 'id' | 'nome' | 'telefone' | 'especialidade'> | null
  itens_pedido: ItemPedido[]
  historico_status: HistoricoStatus[]
}

export type NovoPedidoInput = {
  cliente_id: string
  observacoes: string
  forma_pagamento: FormaPagamento | null
  itens: { produto_id: string; quantidade: number }[]
}

export type AtualizarPedidoInput = {
  status?: StatusPedido
  tecnico_id?: string
  data_instalacao?: string
  forma_pagamento?: FormaPagamento | null
  observacoes?: string | null
}
