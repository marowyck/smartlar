import { createContext, useContext } from 'react'

export type NovoPedidoContextValue = {
  abrir: (clienteId?: string) => void
}

export const NovoPedidoContext = createContext<NovoPedidoContextValue | null>(null)

export function useNovoPedido() {
  const valor = useContext(NovoPedidoContext)
  if (!valor) throw new Error('useNovoPedido precisa estar dentro de NovoPedidoProvider')
  return valor
}
