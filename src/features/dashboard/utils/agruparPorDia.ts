import type { ProximaInstalacao } from '@/features/dashboard/types'
import { diaLocal, formatDataLonga } from '@/utils/format'

export function agruparPorDia(itens: ProximaInstalacao[]) {
  const mapa = new Map<string, ProximaInstalacao[]>()
  for (const item of itens) {
    const chave = diaLocal(item.data_instalacao)
    const lista = mapa.get(chave) ?? []
    lista.push(item)
    mapa.set(chave, lista)
  }
  return [...mapa.entries()].map(([chave, lista]) => ({
    chave,
    titulo: formatDataLonga(lista[0]?.data_instalacao),
    itens: lista,
  }))
}
