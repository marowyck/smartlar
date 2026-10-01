import { createContext, useContext } from 'react'

export type ModoPainel = 'ver' | 'editar'

type PainelContextValue = {
  abrirPedido: (id: string, modo?: ModoPainel) => void
  abrirCliente: (id: string, modo?: ModoPainel) => void
  abrirProduto: (id: string, modo?: ModoPainel) => void
}

export const PainelContext = createContext<PainelContextValue | null>(null)

export function usePainel() {
  const valor = useContext(PainelContext)
  if (!valor) throw new Error('usePainel precisa estar dentro de PainelProvider')
  return valor
}
