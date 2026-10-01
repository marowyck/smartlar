export const FORMAS_PAGAMENTO = [
  { value: 'pix', label: 'Pix' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'a_combinar', label: 'A combinar' },
] as const

export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number]['value']

export function isFormaPagamento(value: string | null | undefined): value is FormaPagamento {
  return FORMAS_PAGAMENTO.some((forma) => forma.value === value)
}

export function labelFormaPagamento(value: string | null | undefined): string {
  return FORMAS_PAGAMENTO.find((forma) => forma.value === value)?.label ?? 'Não informada'
}

export function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (value == null || value === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export { calcularSubtotal, calcularTotal } from '../../features/pedidos/domain/calculos.ts'

export function formatBRL(value: number | string | null | undefined): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(toNumber(value))
}

export function numeroPedido(numero: number): string {
  return `#${String(numero).padStart(3, '0')}`
}
