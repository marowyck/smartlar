import { useMutation, useQuery } from '@tanstack/react-query'
import { listarAgenda } from '@/features/agenda/services/agenda'
import { atualizarPedido } from '@/features/pedidos/services/pedidos'
import { queryKeys } from '@/constants/queryKeys'
import { useInvalidateOperacao } from '@/hooks/useInvalidateOperacao'

export function useAgenda(tecnicoId: string) {
  return useQuery({
    queryKey: queryKeys.agenda.tecnico(tecnicoId),
    queryFn: () => listarAgenda(tecnicoId),
    enabled: Boolean(tecnicoId),
  })
}

export function useAtualizarAgenda() {
  const invalidar = useInvalidateOperacao()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'em_andamento' | 'concluido' }) =>
      atualizarPedido(id, { status }),
    onSuccess: invalidar,
  })
}
