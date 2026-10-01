import { useMutation } from '@tanstack/react-query'
import { atualizarPedido } from '@/features/pedidos/services/pedidos'
import type { AtualizarPedidoInput } from '@/features/pedidos/types'
import { useInvalidateOperacao } from '@/shared/hooks/useInvalidateOperacao'

export function useAtualizarPedido(id: string) {
  const invalidar = useInvalidateOperacao()
  return useMutation({
    mutationFn: (campos: AtualizarPedidoInput) => atualizarPedido(id, campos),
    onSuccess: invalidar,
  })
}
