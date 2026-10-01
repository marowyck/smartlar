export type Produto = {
  id: string
  nome: string
  categoria: string
  preco_unitario: number
  descricao: string | null
  ativo: boolean
  created_at: string
}

export type NovoProdutoInput = {
  nome: string
  categoria: string
  preco_unitario: number
  descricao: string
}
