import { mapResumo } from '@/features/pedidos/services/mappers'
import type { PedidoResumo } from '@/features/pedidos/types'
import { garantir } from '@/utils/result'
import { getSupabase } from '@/services/supabase'

export async function listarAgenda(tecnicoId: string): Promise<PedidoResumo[]> {
  const { data, error } = await getSupabase()
    .from('vw_pedidos_resumo')
    .select('*')
    .eq('tecnico_id', tecnicoId)
    .in('status', ['agendado', 'em_andamento'])
    .order('data_instalacao')
  return (garantir(data, error) as PedidoResumo[]).map(mapResumo)
}
