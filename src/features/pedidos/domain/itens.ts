export type ItemSalvo = {
  id: string
  produtoId: string
  quantidade: number
  precoUnitario: number
}

export type ItemDesejado = {
  id?: string
  produtoId: string
  quantidade: number
}

export type PlanoItens = {
  atualizar: { id: string; quantidade: number }[]
  inserir: { produtoId: string; quantidade: number }[]
  excluir: string[]
}

export function planejarAlteracaoItens(
  salvos: readonly ItemSalvo[],
  desejados: readonly ItemDesejado[],
): PlanoItens {
  const salvosPorId = new Map(salvos.map((item) => [item.id, item]))
  const mantidos = new Set<string>()
  const atualizar: PlanoItens['atualizar'] = []
  const inserir: PlanoItens['inserir'] = []
  const excluir = new Set<string>()

  for (const desejado of desejados) {
    const salvo = desejado.id ? salvosPorId.get(desejado.id) : undefined
    if (!salvo || salvo.produtoId !== desejado.produtoId) {
      if (salvo) excluir.add(salvo.id)
      inserir.push({ produtoId: desejado.produtoId, quantidade: desejado.quantidade })
      continue
    }
    mantidos.add(salvo.id)
    if (salvo.quantidade !== desejado.quantidade) {
      atualizar.push({ id: salvo.id, quantidade: desejado.quantidade })
    }
  }

  for (const salvo of salvos) {
    if (!mantidos.has(salvo.id)) excluir.add(salvo.id)
  }

  return { atualizar, inserir, excluir: [...excluir] }
}

export function precoParaEdicao(
  linha: { id?: string; produtoId: string },
  salvos: readonly ItemSalvo[],
  precoCatalogo: number,
): number {
  const salvo = linha.id ? salvos.find((item) => item.id === linha.id) : undefined
  if (salvo && salvo.produtoId === linha.produtoId) return salvo.precoUnitario
  return precoCatalogo
}
