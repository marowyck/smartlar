import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { Brand } from '@/components/layout/Brand'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { Sidebar } from '@/components/layout/Sidebar'
import { UserFooter } from '@/components/layout/UserFooter'
import { Button } from '@/components/ui/button'
import { tituloDaRota } from '@/config/navigation'
import { routes } from '@/constants/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useNovoPedido } from '@/features/pedidos/context/novo-pedido-context'
import { NovoPedidoProvider } from '@/features/pedidos/context/NovoPedidoProvider'
import { PainelProvider } from '@/store/PainelProvider'

export function AppLayout() {
  return (
    <NovoPedidoProvider>
      <PainelProvider>
        <Shell />
      </PainelProvider>
    </NovoPedidoProvider>
  )
}

function Shell() {
  const { session, signOut } = useAuth()
  const { abrir } = useNovoPedido()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)

  async function sair() {
    await signOut()
    navigate(routes.login)
  }

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="sticky top-0 hidden h-svh w-16 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex lg:w-64">
        <div className="flex h-full flex-col lg:hidden">
          <Brand compacta />
          <Sidebar compacto onNovoPedido={() => abrir()} />
          <Button
            variant="ghost"
            size="icon"
            className="mb-3 mt-auto self-center"
            aria-label="Sair"
            onClick={() => void sair()}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
        <div className="hidden h-full flex-col lg:flex">
          <Brand />
          <Sidebar onNovoPedido={() => abrir()} />
          <UserFooter email={session?.user.email} onSignOut={() => void sair()} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader titulo={tituloDaRota(location.pathname)} onAbrirMenu={() => setMenuAberto(true)} />
        <main className="min-w-0 flex-1 pb-24 md:pb-0">
          <Outlet />
        </main>
        <BottomNav onNovoPedido={() => abrir()} onMais={() => setMenuAberto(true)} />
      </div>

      <MobileMenu aberto={menuAberto} onOpenChange={setMenuAberto}>
        <Brand />
        <Sidebar onNavigate={() => setMenuAberto(false)} onNovoPedido={() => abrir()} />
        <UserFooter email={session?.user.email} onSignOut={() => void sair()} />
      </MobileMenu>
    </div>
  )
}
