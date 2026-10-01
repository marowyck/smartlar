import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atualizarProduto, criarProduto, listarProdutos } from '@/features/produtos/services/produtos'
import { queryKeys } from '@/shared/constants/queryKeys'
import type { NovoProdutoInput } from '@/features/produtos/types'

export function useProdutos(enabled = true) {
  return useQuery({
    queryKey: queryKeys.produtos.all,
    queryFn: listarProdutos,
    enabled,
  })
}

export function useCriarProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NovoProdutoInput) => criarProduto(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.produtos.all })
    },
  })
}

export function useAtualizarProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: NovoProdutoInput }) => atualizarProduto(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.produtos.all })
    },
  })
}
