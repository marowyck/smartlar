import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ClienteDialog } from '@/features/clientes/components/ClienteDialog'
import { PedidoDialog } from '@/features/pedidos/components/PedidoDialog'
import { ProdutoDialog } from '@/features/produtos/components/ProdutoDialog'
import { PainelContext, type ModoPainel } from '@/app/layouts/painel-context'

type Alvo = {
  entidade: 'pedido' | 'cliente' | 'produto'
  id: string
  modo: ModoPainel
}

export function PainelProvider({ children }: { children: ReactNode }) {
  const [alvo, setAlvo] = useState<Alvo | null>(null)

  const abrir = useCallback((entidade: Alvo['entidade'], id: string, modo: ModoPainel = 'ver') => {
    setAlvo({ entidade, id, modo })
  }, [])

  const valor = useMemo(
    () => ({
      abrirPedido: (id: string, modo?: ModoPainel) => abrir('pedido', id, modo),
      abrirCliente: (id: string, modo?: ModoPainel) => abrir('cliente', id, modo),
      abrirProduto: (id: string, modo?: ModoPainel) => abrir('produto', id, modo),
    }),
    [abrir],
  )

  function fechar(aberto: boolean) {
    if (!aberto) setAlvo(null)
  }

  function mudarModo(modo: ModoPainel) {
    setAlvo((atual) => (atual ? { ...atual, modo } : atual))
  }

  return (
    <PainelContext.Provider value={valor}>
      {children}
      <PedidoDialog
        id={alvo?.entidade === 'pedido' ? alvo.id : ''}
        modo={alvo?.entidade === 'pedido' ? alvo.modo : 'ver'}
        aberto={alvo?.entidade === 'pedido'}
        onOpenChange={fechar}
        onModo={mudarModo}
        onAbrirCliente={(id) => abrir('cliente', id, 'ver')}
      />
      <ClienteDialog
        id={alvo?.entidade === 'cliente' ? alvo.id : ''}
        modo={alvo?.entidade === 'cliente' ? alvo.modo : 'ver'}
        aberto={alvo?.entidade === 'cliente'}
        onOpenChange={fechar}
        onModo={mudarModo}
        onAbrirPedido={(id) => abrir('pedido', id, 'ver')}
      />
      <ProdutoDialog
        id={alvo?.entidade === 'produto' ? alvo.id : ''}
        modo={alvo?.entidade === 'produto' ? alvo.modo : 'ver'}
        aberto={alvo?.entidade === 'produto'}
        onOpenChange={fechar}
        onModo={mudarModo}
      />
    </PainelContext.Provider>
  )
}
