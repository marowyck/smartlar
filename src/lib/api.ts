import { isFormaPagamento, toNumber } from '@/lib/money'
import { isStatusPedido, type StatusPedido } from '@/lib/status'
import { getSupabase } from '@/lib/supabase'
import type {
  AtualizarPedidoInput,
  Cliente,
  DashboardKpis,
  HistoricoStatus,
  ItemPedido,
  NovoClienteInput,
  NovoPedidoInput,
  NovoProdutoInput,
  PedidoDetalhe,
  PedidoResumo,
  Produto,
  ProximaInstalacao,
  Tecnico,
} from '@/lib/types'

type ErroSupabase = { message: string } | null

function garantir<T>(data: T | null, error: ErroSupabase): T {
  if (error) throw new Error(error.message)
  if (data == null) throw new Error('Resposta vazia do Supabase')
  return data
}

function um<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function termoBusca(busca: string): string {
  return busca.trim().replace(/[%_,]/g, '')
}

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

export async function listarProdutos(): Promise<Produto[]> {
  const { data, error } = await getSupabase()
    .from('produtos')
    .select('*')
    .order('categoria')
    .order('nome')
  return (garantir(data, error) as Produto[]).map((produto) => ({
    ...produto,
    preco_unitario: toNumber(produto.preco_unitario),
  }))
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
  const produto = garantir(data, error) as Produto
  return { ...produto, preco_unitario: toNumber(produto.preco_unitario) }
}

export async function atualizarPreco(id: string, precoUnitario: number): Promise<void> {
  const { error } = await getSupabase()
    .from('produtos')
    .update({ preco_unitario: precoUnitario })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function listarTecnicos(): Promise<Tecnico[]> {
  const { data, error } = await getSupabase()
    .from('tecnicos')
    .select('*')
    .eq('ativo', true)
    .order('nome')
  return garantir(data, error) as Tecnico[]
}

export async function obterKpis(): Promise<DashboardKpis> {
  const { data, error } = await getSupabase().from('vw_dashboard_kpis').select('*').limit(1)
  const linha = (garantir(data, error) as DashboardKpis[])[0]
  if (!linha) throw new Error('Não foi possível carregar os indicadores')
  return {
    pedidos_mes: toNumber(linha.pedidos_mes),
    valor_faturado: toNumber(linha.valor_faturado),
    valor_a_receber: toNumber(linha.valor_a_receber),
    pendentes_agendamento: toNumber(linha.pendentes_agendamento),
  }
}

export async function listarProximasInstalacoes(): Promise<ProximaInstalacao[]> {
  const { data, error } = await getSupabase()
    .from('vw_proximas_instalacoes')
    .select('*')
    .order('data_instalacao')
  return (garantir(data, error) as ProximaInstalacao[]).map((item) => ({
    ...item,
    valor_total: toNumber(item.valor_total),
    numero: toNumber(item.numero),
  }))
}

function mapResumo(row: PedidoResumo): PedidoResumo {
  return {
    ...row,
    numero: toNumber(row.numero),
    valor_total: toNumber(row.valor_total),
    forma_pagamento: isFormaPagamento(row.forma_pagamento) ? row.forma_pagamento : null,
    status: row.status,
  }
}

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

  const row = garantir(data, error) as PedidoDetalhe & {
    valor_total: number | string
    clientes: Cliente | Cliente[] | null
    tecnicos: PedidoDetalhe['tecnicos'] | NonNullable<PedidoDetalhe['tecnicos']>[] | null
    itens_pedido: ItemPedido[] | null
    historico_status: HistoricoStatus[] | null
  }

  if (!isStatusPedido(row.status)) {
    throw new Error(`Status desconhecido: ${row.status}`)
  }

  const itens = (row.itens_pedido ?? []).map((item) => ({
    ...item,
    produtos: um(item.produtos),
    quantidade: toNumber(item.quantidade),
    preco_unitario: toNumber(item.preco_unitario),
    subtotal: toNumber(item.subtotal),
  }))

  const historico = [...(row.historico_status ?? [])].sort((a, b) =>
    a.alterado_em.localeCompare(b.alterado_em),
  )

  return {
    ...row,
    numero: toNumber(row.numero),
    valor_total: toNumber(row.valor_total),
    forma_pagamento: isFormaPagamento(row.forma_pagamento) ? row.forma_pagamento : null,
    clientes: um(row.clientes),
    tecnicos: um(row.tecnicos),
    itens_pedido: itens,
    historico_status: historico,
  }
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

export async function listarAgenda(tecnicoId: string): Promise<PedidoResumo[]> {
  const { data, error } = await getSupabase()
    .from('vw_pedidos_resumo')
    .select('*')
    .eq('tecnico_id', tecnicoId)
    .in('status', ['agendado', 'em_andamento'])
    .order('data_instalacao')
  return (garantir(data, error) as PedidoResumo[]).map(mapResumo)
}
