import { useQuery } from '@tanstack/react-query'
import { obterPedido } from '@/features/pedidos/services/pedidos'
import { queryKeys } from '@/constants/queryKeys'

export function usePedido(id: string) {
  return useQuery({
    queryKey: queryKeys.pedidos.detail(id),
    queryFn: () => obterPedido(id),
    enabled: Boolean(id),
  })
}
