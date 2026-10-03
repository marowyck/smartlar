function reais(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

function numero(valor: number) {
  return `#${String(valor).padStart(3, '0')}`
}

export function textoOrcamentoWhatsapp(pedido: {
  numero: number
  clienteNome: string
  itens: readonly { quantidade: number; nome: string; subtotal: number }[]
  desconto: number
  valorTotal: number
}) {
  const linhas = [
    `Olá, ${pedido.clienteNome}! Segue o orçamento ${numero(pedido.numero)} da SmartLar.`,
    '',
    ...pedido.itens.map((item) => `• ${item.quantidade}x ${item.nome} — ${reais(item.subtotal)}`),
  ]
  if (pedido.desconto > 0) {
    linhas.push('', `Desconto: ${reais(pedido.desconto)}`)
  }
  linhas.push(`Total: ${reais(pedido.valorTotal)}`)
  return linhas.join('\n')
}
