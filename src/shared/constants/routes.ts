export const routes = {
  home: '/',
  login: '/login',
  clientes: '/clientes',
  cliente: (id: string) => `/clientes/${id}`,
  produtos: '/produtos',
  pedidos: '/pedidos',
  pedidosFiltrados: (status: string) => `/pedidos?status=${status}`,
  novoPedido: '/pedidos/novo',
  pedido: (id: string) => `/pedidos/${id}`,
  agenda: '/agenda',
} as const
