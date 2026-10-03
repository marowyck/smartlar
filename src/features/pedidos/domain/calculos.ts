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

export function aplicarDesconto(subtotal: number, desconto: number): number {
  const abatimento = Number.isFinite(desconto) ? desconto : 0
  const centavos = Math.round(subtotal * 100) - Math.round(abatimento * 100)
  return Math.max(0, centavos) / 100
}
