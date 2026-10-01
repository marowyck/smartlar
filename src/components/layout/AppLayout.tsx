import {
  CalendarDays,
  ClipboardList,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { cn } from 'cn'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/pedidos/novo', label: 'Novo pedido', icon: Plus },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
]

function itemAtivo(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  if (to === '/pedidos') {
    return pathname === '/pedidos' || (/^\/pedidos\/(?!novo$).+/.test(pathname))
  }
  return pathname === to || pathname.startsWith(`${to}/`)
}

function Navegacao({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {links.map((link) => {
        const Icon = link.icon
        const ativo = itemAtivo(location.pathname, link.to)
        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
              ativo && 'bg-muted text-foreground',
            )}
          >
            <Icon />
            {link.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

function Marca() {
  return (
    <div className="flex items-center gap-2 px-4 py-4">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <House className="size-4" />
      </span>
      <div>
        <p className="text-sm font-semibold leading-none">SmartLar</p>
        <p className="mt-1 text-xs text-muted-foreground">Instalações</p>
      </div>
    </div>
  )
}

export function AppLayout() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  async function sair() {
    await signOut()
    navigate('/login')
  }

  const rodape = (
    <div className="border-t p-3">
      <p className="truncate px-2 text-xs text-muted-foreground">{session?.user.email}</p>
      <Button variant="ghost" className="mt-1 w-full justify-start" onClick={() => void sair()}>
        <LogOut />
        Sair
      </Button>
    </div>
  )

  return (
    <div className="flex min-h-svh bg-muted/40">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
        <Marca />
        <Navegacao />
        {rodape}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b bg-background px-4 py-3 md:hidden">
          <Button variant="outline" size="icon" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">
            <Menu />
          </Button>
          <p className="text-sm font-semibold">SmartLar</p>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <Marca />
          <Navegacao onNavigate={() => setMenuAberto(false)} />
          {rodape}
        </SheetContent>
      </Sheet>
    </div>
  )
}
