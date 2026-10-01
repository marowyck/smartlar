import type { StatusPedido } from '@/features/pedidos/domain/status'
import { mapPedido, mapResumo } from '@/features/pedidos/services/mappers'
import type {
  AtualizarPedidoInput,
  NovoPedidoInput,
  PedidoDetalhe,
  PedidoResumo,
} from '@/features/pedidos/types'
import { garantir } from '@/utils/result'
import { getSupabase } from '@/services/supabase'

export async function listarPedidos(status?: StatusPedido | null): Promise<PedidoResumo[]> {
  let query = getSupabase().from('vw_pedidos_resumo').select('*').order('created_at', {
    ascending: false,
  })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  return (garantir(data, error) as PedidoResumo[]).map(mapResumo)
}

export async function listarPedidosDoCliente(clienteId: string): Promise<PedidoResumo[]> {
  const { data, error } = await getSupabase()
    .from('vw_pedidos_resumo')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
  return (garantir(data, error) as PedidoResumo[]).map(mapResumo)
}

export async function obterPedido(id: string): Promise<PedidoDetalhe> {
  const { data, error } = await getSupabase()
    .from('pedidos')
    .select(
      `
      *,
      clientes (id, nome, telefone, email, endereco, created_at),
      tecnicos (id, nome, telefone, especialidade),
      itens_pedido (
        id, quantidade, preco_unitario, subtotal,
        produtos (id, nome, categoria)
      ),
      historico_status (id, status_anterior, status_novo, alterado_em)
    `,
    )
    .eq('id', id)
    .single()

  return mapPedido(garantir(data, error))
}

export async function criarPedido(input: NovoPedidoInput): Promise<string> {
  const { data, error } = await getSupabase().rpc('criar_pedido', {
    p_cliente_id: input.cliente_id,
    p_observacoes: input.observacoes.trim() || null,
    p_forma_pagamento: input.forma_pagamento,
    p_itens: input.itens,
  })
  return garantir(data as string | null, error)
}

export async function atualizarPedido(id: string, campos: AtualizarPedidoInput): Promise<void> {
  const { error } = await getSupabase().from('pedidos').update(campos).eq('id', id)
  if (error) throw new Error(error.message)
}
