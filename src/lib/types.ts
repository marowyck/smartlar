import type { FormaPagamento } from '@/lib/money'
import type { StatusPedido } from '@/lib/status'

export type Cliente = {
  id: string
  nome: string
  telefone: string
  email: string | null
  endereco: string
  created_at: string
}

export type Tecnico = {
  id: string
  nome: string
  telefone: string
  especialidade: string
  ativo: boolean
  created_at: string
}

export type Produto = {
  id: string
  nome: string
  categoria: string
  preco_unitario: number
  descricao: string | null
  ativo: boolean
  created_at: string
}

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

export type DashboardKpis = {
  pedidos_mes: number
  valor_faturado: number
  valor_a_receber: number
  pendentes_agendamento: number
}

export type ProximaInstalacao = {
  id: string
  numero: number
  data_instalacao: string
  status: StatusPedido
  valor_total: number
  cliente_nome: string
  endereco: string
  cliente_telefone: string
  tecnico_id: string | null
  tecnico_nome: string | null
}

export type NovoClienteInput = {
  nome: string
  telefone: string
  email: string
  endereco: string
}

export type NovoProdutoInput = {
  nome: string
  categoria: string
  preco_unitario: number
  descricao: string
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
}
