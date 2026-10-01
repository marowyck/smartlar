import type { PedidoResumo } from '@/features/pedidos/types'
import { diaLocal, formatDataLonga } from '@/utils/format'

export function agruparPorDia(itens: PedidoResumo[]) {
  const mapa = new Map<string, PedidoResumo[]>()
  for (const item of itens) {
    const chave = item.data_instalacao ? diaLocal(item.data_instalacao) : 'sem-data'
    const lista = mapa.get(chave) ?? []
    lista.push(item)
    mapa.set(chave, lista)
  }
  return [...mapa.entries()].map(([chave, lista]) => ({
    chave,
    titulo: lista[0]?.data_instalacao ? formatDataLonga(lista[0].data_instalacao) : 'Sem data',
    itens: lista,
  }))
}
