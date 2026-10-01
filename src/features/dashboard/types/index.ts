import type { StatusPedido } from '@/features/pedidos/domain/status'

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
