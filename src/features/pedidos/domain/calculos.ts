export function calcularSubtotal(quantidade: number, precoUnitario: number): number {
  return Math.round(quantidade * precoUnitario * 100) / 100
}

export function calcularTotal(
  itens: readonly { quantidade: number; precoUnitario: number }[],
): number {
  const centavos = itens.reduce((total, item) => {
    const quantidade = Number.isFinite(item.quantidade) ? item.quantidade : 0
    const preco = Number.isFinite(item.precoUnitario) ? item.precoUnitario : 0
    return total + Math.round(quantidade * preco * 100)
  }, 0)
  return centavos / 100
}
