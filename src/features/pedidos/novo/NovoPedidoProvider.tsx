import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { NovoPedidoDialog } from '@/features/pedidos/novo/NovoPedidoDialog'
import { NovoPedidoContext } from '@/features/pedidos/novo/novo-pedido-context'

export function NovoPedidoProvider({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false)
  const [clienteId, setClienteId] = useState<string | undefined>()

  const abrir = useCallback((id?: string) => {
    setClienteId(id)
    setAberto(true)
  }, [])

  const valor = useMemo(() => ({ abrir }), [abrir])

  return (
    <NovoPedidoContext.Provider value={valor}>
      {children}
      <NovoPedidoDialog
        aberto={aberto}
        clienteInicial={clienteId}
        onOpenChange={(next) => {
          setAberto(next)
          if (!next) setClienteId(undefined)
        }}
      />
    </NovoPedidoContext.Provider>
  )
}
