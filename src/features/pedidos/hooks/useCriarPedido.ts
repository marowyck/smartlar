import { useMutation } from '@tanstack/react-query'
import { criarPedido } from '@/features/pedidos/services/pedidos'
import type { NovoPedidoInput } from '@/features/pedidos/types'
import { useInvalidateOperacao } from '@/hooks/useInvalidateOperacao'

export function useCriarPedido() {
  const invalidar = useInvalidateOperacao()
  return useMutation({
    mutationFn: (input: NovoPedidoInput) => criarPedido(input),
    onSuccess: invalidar,
  })
}
