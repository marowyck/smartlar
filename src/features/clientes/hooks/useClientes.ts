import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atualizarCliente, criarCliente, listarClientes, obterCliente } from '@/features/clientes/services/clientes'
import { listarPedidosDoCliente } from '@/features/pedidos/services/pedidos'
import { queryKeys } from '@/shared/constants/queryKeys'
import type { NovoClienteInput } from '@/features/clientes/types'

export function useClientes(busca: string) {
  return useQuery({
    queryKey: queryKeys.clientes.list(busca),
    queryFn: () => listarClientes(busca),
  })
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: queryKeys.clientes.detail(id),
    queryFn: () => obterCliente(id),
    enabled: Boolean(id),
  })
}

export function usePedidosDoCliente(id: string) {
  return useQuery({
    queryKey: queryKeys.clientes.pedidos(id),
    queryFn: () => listarPedidosDoCliente(id),
    enabled: Boolean(id),
  })
}

export function useAtualizarCliente(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NovoClienteInput) => atualizarCliente(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
    },
  })
}

export function useCriarCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NovoClienteInput) => criarCliente(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
    },
  })
}
