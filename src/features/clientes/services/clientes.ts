import { garantir, termoBusca } from '@/utils/result'
import { getSupabase } from '@/services/supabase'
import type { Cliente, NovoClienteInput } from '@/features/clientes/types'

export async function listarClientes(busca = ''): Promise<Cliente[]> {
  let query = getSupabase().from('clientes').select('*').order('nome')
  const termo = termoBusca(busca)
  if (termo) {
    query = query.or(`nome.ilike.%${termo}%,telefone.ilike.%${termo}%`)
  }
  const { data, error } = await query
  return garantir(data, error) as Cliente[]
}

export async function obterCliente(id: string): Promise<Cliente> {
  const { data, error } = await getSupabase().from('clientes').select('*').eq('id', id).single()
  return garantir(data, error) as Cliente
}

export async function criarCliente(input: NovoClienteInput): Promise<Cliente> {
  const { data, error } = await getSupabase()
    .from('clientes')
    .insert({
      nome: input.nome.trim(),
      telefone: input.telefone.trim(),
      email: input.email.trim() || null,
      endereco: input.endereco.trim(),
    })
    .select('*')
    .single()
  return garantir(data, error) as Cliente
}

export async function atualizarCliente(id: string, input: NovoClienteInput): Promise<void> {
  const { error } = await getSupabase()
    .from('clientes')
    .update({
      nome: input.nome.trim(),
      telefone: input.telefone.trim(),
      email: input.email.trim() || null,
      endereco: input.endereco.trim(),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
