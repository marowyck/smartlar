import { useMutation } from '@tanstack/react-query'
import type { PlanoItens } from '@/features/pedidos/domain/itens'
import { salvarItensPedido } from '@/features/pedidos/services/pedidos'
import { useInvalidateOperacao } from '@/hooks/useInvalidateOperacao'

export function useSalvarItens(pedidoId: string) {
  const invalidar = useInvalidateOperacao()
  return useMutation({
    mutationFn: (plano: PlanoItens) => salvarItensPedido(pedidoId, plano),
    onSuccess: invalidar,
  })
}
