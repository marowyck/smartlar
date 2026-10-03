import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDataHora(iso: string | null | undefined): string {
  if (!iso) return '—'
  return format(parseISO(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatDataLonga(iso: string | null | undefined): string {
  if (!iso) return '—'
  return format(parseISO(iso), "EEEE, dd 'de' MMMM", { locale: ptBR })
}

export function chaveDia(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

export function diaLocal(iso: string): string {
  return chaveDia(parseISO(iso))
}

export function diasDesde(iso: string | null | undefined): number {
  if (!iso) return 0
  return Math.max(0, differenceInCalendarDays(new Date(), parseISO(iso)))
}

export function rotuloDias(dias: number): string {
  if (dias <= 0) return 'Hoje'
  if (dias === 1) return 'Há 1 dia'
  return `Há ${dias} dias`
}
