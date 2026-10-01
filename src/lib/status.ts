export const STATUS_PEDIDO = [
  'orcamento',
  'aprovado',
  'agendado',
  'em_andamento',
  'concluido',
  'cancelado',
] as const

export type StatusPedido = (typeof STATUS_PEDIDO)[number]

export const TRANSICOES: Record<StatusPedido, readonly StatusPedido[]> = {
  orcamento: ['aprovado', 'cancelado'],
  aprovado: ['agendado', 'cancelado'],
  agendado: ['em_andamento'],
  em_andamento: ['concluido'],
  concluido: [],
  cancelado: [],
}

export const STATUS_LABEL: Record<StatusPedido, string> = {
  orcamento: 'Orçamento',
  aprovado: 'Aprovado',
  agendado: 'Agendado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export const STATUS_ACAO: Record<StatusPedido, string> = {
  orcamento: 'Voltar para orçamento',
  aprovado: 'Aprovar orçamento',
  agendado: 'Agendar instalação',
  em_andamento: 'Marcar em andamento',
  concluido: 'Concluir instalação',
  cancelado: 'Cancelar pedido',
}

export function podeTransitar(de: StatusPedido, para: StatusPedido): boolean {
  return TRANSICOES[de].includes(para)
}

export function exigeAgendamento(status: StatusPedido): boolean {
  return status === 'agendado'
}

export function isStatusPedido(value: string | null): value is StatusPedido {
  return STATUS_PEDIDO.some((status) => status === value)
}
