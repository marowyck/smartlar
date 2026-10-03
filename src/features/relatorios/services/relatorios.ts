import type {
  Conversao,
  DesempenhoTecnico,
  FaturamentoMensal,
  PedidoPorStatus,
  ProdutoVendido,
} from '@/features/relatorios/types'
import { isStatusPedido } from '@/features/pedidos/domain/status'
import { toNumber } from '@/utils/money'
import { garantir } from '@/utils/result'
import { getSupabase } from '@/services/supabase'

export async function listarFaturamentoMensal(): Promise<FaturamentoMensal[]> {
  const { data, error } = await getSupabase().from('vw_faturamento_mensal').select('*').order('mes')
  return (garantir(data, error) as FaturamentoMensal[]).map((linha) => ({
    mes: String(linha.mes).slice(0, 10),
    valor_faturado: toNumber(linha.valor_faturado),
    pedidos: toNumber(linha.pedidos),
  }))
}

export async function listarPedidosPorStatus(): Promise<PedidoPorStatus[]> {
  const { data, error } = await getSupabase().from('vw_pedidos_por_status').select('*')
  return (garantir(data, error) as PedidoPorStatus[])
    .filter((linha) => isStatusPedido(linha.status))
    .map((linha) => ({
      status: linha.status,
      quantidade: toNumber(linha.quantidade),
      valor: toNumber(linha.valor),
    }))
}

export async function listarProdutosVendidos(): Promise<ProdutoVendido[]> {
  const { data, error } = await getSupabase().from('vw_produtos_vendidos').select('*').order('receita', { ascending: false })
  return (garantir(data, error) as ProdutoVendido[]).map((linha) => ({
    ...linha,
    quantidade: toNumber(linha.quantidade),
    receita: toNumber(linha.receita),
  }))
}

export async function listarDesempenho(): Promise<DesempenhoTecnico[]> {
  const { data, error } = await getSupabase().from('vw_desempenho_tecnico').select('*').order('nome')
  return (garantir(data, error) as DesempenhoTecnico[]).map((linha) => ({
    ...linha,
    concluidas_mes: toNumber(linha.concluidas_mes),
    faturado_mes: toNumber(linha.faturado_mes),
    carga_semana: toNumber(linha.carga_semana),
  }))
}

export async function obterConversao(): Promise<Conversao> {
  const { data, error } = await getSupabase().from('vw_conversao').select('*').limit(1)
  const linha = (garantir(data, error) as Conversao[])[0]
  if (!linha) throw new Error('Não foi possível carregar a conversão')
  return {
    total_pedidos: toNumber(linha.total_pedidos),
    convertidos: toNumber(linha.convertidos),
    taxa_percentual: toNumber(linha.taxa_percentual),
    ticket_medio: toNumber(linha.ticket_medio),
    total_descontado: toNumber(linha.total_descontado),
  }
}
