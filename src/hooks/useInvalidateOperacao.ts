import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'

export function useInvalidateOperacao() {
  const queryClient = useQueryClient()

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.pedidos.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.agenda.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.relatorios.all }),
    ])
  }
}
