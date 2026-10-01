export type Cliente = {
  id: string
  nome: string
  telefone: string
  email: string | null
  endereco: string
  created_at: string
}

export type NovoClienteInput = {
  nome: string
  telefone: string
  email: string
  endereco: string
}
