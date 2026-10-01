import type { DashboardKpis, ProximaInstalacao } from '@/features/dashboard/types'
import { toNumber } from '@/shared/lib/money'
import { garantir } from '@/shared/lib/result'
import { getSupabase } from '@/services/supabase'

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
