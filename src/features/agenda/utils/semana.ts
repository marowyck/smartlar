import { startOfWeek } from 'date-fns'

export function inicioDaSemana(referencia: Date) {
  return startOfWeek(referencia, { weekStartsOn: 1 })
}
