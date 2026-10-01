import { garantir } from '@/shared/lib/result'
import { toNumber } from '@/shared/lib/money'
import { getSupabase } from '@/services/supabase'
import type { NovoProdutoInput, Produto } from '@/features/produtos/types'

function mapProduto(produto: Produto): Produto {
  return { ...produto, preco_unitario: toNumber(produto.preco_unitario) }
}

export async function listarProdutos(): Promise<Produto[]> {
  const { data, error } = await getSupabase()
    .from('produtos')
    .select('*')
    .order('categoria')
    .order('nome')
  return (garantir(data, error) as Produto[]).map(mapProduto)
}

export async function criarProduto(input: NovoProdutoInput): Promise<Produto> {
  const { data, error } = await getSupabase()
    .from('produtos')
    .insert({
      nome: input.nome.trim(),
      categoria: input.categoria.trim(),
      preco_unitario: input.preco_unitario,
      descricao: input.descricao.trim() || null,
      ativo: true,
    })
    .select('*')
    .single()
  return mapProduto(garantir(data, error) as Produto)
}

export async function atualizarProduto(id: string, input: NovoProdutoInput): Promise<void> {
  const { error } = await getSupabase()
    .from('produtos')
    .update({
      nome: input.nome.trim(),
      categoria: input.categoria.trim(),
      preco_unitario: input.preco_unitario,
      descricao: input.descricao.trim() || null,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
