import type { StatusPedido } from '@/features/pedidos/domain/status'

export const queryKeys = {
  clientes: {
    all: ['clientes'] as const,
    list: (busca: string) => ['clientes', 'list', busca] as const,
    detail: (id: string) => ['clientes', 'detail', id] as const,
    pedidos: (id: string) => ['clientes', 'pedidos', id] as const,
  },
  produtos: {
    all: ['produtos'] as const,
  },
  tecnicos: {
    all: ['tecnicos'] as const,
  },
  pedidos: {
    all: ['pedidos'] as const,
    list: (status: StatusPedido | 'todos') => ['pedidos', 'list', status] as const,
    detail: (id: string) => ['pedidos', 'detail', id] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    kpis: ['dashboard', 'kpis'] as const,
    proximas: ['dashboard', 'proximas'] as const,
  },
  relatorios: {
    all: ['relatorios'] as const,
    faturamento: ['relatorios', 'faturamento'] as const,
    status: ['relatorios', 'status'] as const,
    produtos: ['relatorios', 'produtos'] as const,
    equipe: ['relatorios', 'equipe'] as const,
    conversao: ['relatorios', 'conversao'] as const,
  },
  agenda: {
    all: ['agenda'] as const,
    aberta: ['agenda', 'aberta'] as const,
    tecnico: (id: string) => ['agenda', id] as const,
  },
}
