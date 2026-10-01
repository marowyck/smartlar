import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atualizarPreco, criarProduto, listarProdutos } from '@/features/produtos/services/produtos'
import { queryKeys } from '@/shared/constants/queryKeys'
import type { NovoProdutoInput } from '@/features/produtos/types'

export function useProdutos() {
  return useQuery({
    queryKey: queryKeys.produtos.all,
    queryFn: listarProdutos,
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

export function useAtualizarPreco() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, preco }: { id: string; preco: number }) => atualizarPreco(id, preco),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.produtos.all })
    },
  })
}
