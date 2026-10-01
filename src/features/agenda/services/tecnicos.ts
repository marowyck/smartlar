import { garantir } from '@/utils/result'
import { getSupabase } from '@/services/supabase'
import type { Tecnico } from '@/features/agenda/types'

export async function listarTecnicos(): Promise<Tecnico[]> {
  const { data, error } = await getSupabase()
    .from('tecnicos')
    .select('*')
    .eq('ativo', true)
    .order('nome')
  return garantir(data, error) as Tecnico[]
}
