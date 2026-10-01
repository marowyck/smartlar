import { useQuery } from '@tanstack/react-query'
import type { StatusPedido } from '@/features/pedidos/domain/status'
import { listarPedidos } from '@/features/pedidos/services/pedidos'
import { queryKeys } from '@/shared/constants/queryKeys'

export function usePedidos(status: StatusPedido | 'todos') {
  return useQuery({
    queryKey: queryKeys.pedidos.list(status),
    queryFn: () => listarPedidos(status === 'todos' ? null : status),
  })
}
