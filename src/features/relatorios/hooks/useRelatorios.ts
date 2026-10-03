import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import {
  listarDesempenho,
  listarFaturamentoMensal,
  listarPedidosPorStatus,
  listarProdutosVendidos,
  obterConversao,
} from '@/features/relatorios/services/relatorios'

export function useFaturamentoMensal() {
  return useQuery({
    queryKey: queryKeys.relatorios.faturamento,
    queryFn: listarFaturamentoMensal,
  })
}

export function usePedidosPorStatus() {
  return useQuery({
    queryKey: queryKeys.relatorios.status,
    queryFn: listarPedidosPorStatus,
  })
}

export function useProdutosVendidos() {
  return useQuery({
    queryKey: queryKeys.relatorios.produtos,
    queryFn: listarProdutosVendidos,
  })
}

export function useDesempenho() {
  return useQuery({
    queryKey: queryKeys.relatorios.equipe,
    queryFn: listarDesempenho,
  })
}

export function useConversao() {
  return useQuery({
    queryKey: queryKeys.relatorios.conversao,
    queryFn: obterConversao,
  })
}
