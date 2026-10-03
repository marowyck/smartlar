import type { StatusPedido } from '@/features/pedidos/domain/status'

export type FaturamentoMensal = {
  mes: string
  valor_faturado: number
  pedidos: number
}

export type PedidoPorStatus = {
  status: StatusPedido
  quantidade: number
  valor: number
}

export type ProdutoVendido = {
  id: string
  nome: string
  categoria: string
  quantidade: number
  receita: number
}

export type DesempenhoTecnico = {
  id: string
  nome: string
  telefone: string
  especialidade: string
  ativo: boolean
  concluidas_mes: number
  faturado_mes: number
  carga_semana: number
  proxima_instalacao: string | null
}

export type Conversao = {
  total_pedidos: number
  convertidos: number
  taxa_percentual: number
  ticket_medio: number
  total_descontado: number
}
