export const ORDEM_CATEGORIAS = ['Segurança', 'Iluminação', 'Automação']

export function ordenarCategorias(nomes: Iterable<string>): string[] {
  return [...new Set(nomes)].sort((a, b) => {
    const ia = ORDEM_CATEGORIAS.indexOf(a)
    const ib = ORDEM_CATEGORIAS.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b, 'pt-BR')
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}
