import { useQuery } from '@tanstack/react-query'
import { listarProximasInstalacoes, obterKpis } from '@/features/dashboard/services/dashboard'
import { listarPedidos } from '@/features/pedidos/services/pedidos'
import { queryKeys } from '@/shared/constants/queryKeys'

export function useKpis() {
  return useQuery({
    queryKey: queryKeys.dashboard.kpis,
    queryFn: obterKpis,
  })
}

export function useProximasInstalacoes() {
  return useQuery({
    queryKey: queryKeys.dashboard.proximas,
    queryFn: listarProximasInstalacoes,
  })
}

export function useOrcamentosParados() {
  return useQuery({
    queryKey: queryKeys.pedidos.list('orcamento'),
    queryFn: () => listarPedidos('orcamento'),
  })
}
