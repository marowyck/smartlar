import { useQuery } from '@tanstack/react-query'
import { listarTecnicos } from '@/features/agenda/services/tecnicos'
import { queryKeys } from '@/shared/constants/queryKeys'

export function useTecnicos() {
  return useQuery({
    queryKey: queryKeys.tecnicos.all,
    queryFn: listarTecnicos,
  })
}
