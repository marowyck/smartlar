import { LogOut, Menu, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { itemAtivo, marca as MarcaIcon, navInferior, navPrincipal, tituloDaRota } from '@/app/layouts/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'

function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 px-3 py-4', compacta && 'justify-center px-2')}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <MarcaIcon className="size-4" />
      </span>
      {compacta ? null : (
        <div>
          <p className="text-sm font-semibold leading-none">SmartLar</p>
          <p className="mt-1 text-xs text-muted-foreground">Instalações</p>
        </div>
      )}
    </div>
  )
}

function Links({
  compacto = false,
  onNavigate,
}: {
  compacto?: boolean
  onNavigate?: () => void
}) {
  const location = useLocation()

  return (
    <nav className="flex flex-1 flex-col gap-1 px-2">
      {navPrincipal.map((link) => {
        const Icon = link.icon
        const ativo = itemAtivo(location.pathname, link.to)
        return (
          <NavLink
            key={link.to}
            to={link.to}
            title={link.label}
            onClick={onNavigate}
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              compacto && 'justify-center px-0',
              ativo && 'bg-sidebar-accent text-sidebar-accent-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {compacto ? <span className="sr-only">{link.label}</span> : link.label}
          </NavLink>
        )
      })}
      <NavLink
        to="/pedidos/novo"
        onClick={onNavigate}
        className={cn(
          'mt-2 flex min-h-11 items-center justify-center rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90',
          compacto && 'px-0',
        )}
      >
        {compacto ? '＋' : 'Novo pedido'}
      </NavLink>
    </nav>
  )
}

export function AppShell() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)

  async function sair() {
    await signOut()
    navigate('/login')
  }

  const rodape = (
    <div className="mt-auto border-t border-sidebar-border p-3">
      <p className="truncate px-2 text-xs text-muted-foreground">{session?.user.email}</p>
      <Button variant="ghost" className="mt-1 w-full justify-start" onClick={() => void sair()}>
        <LogOut className="size-4" />
        Sair
      </Button>
    </div>
  )

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="sticky top-0 hidden h-svh w-16 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex lg:w-64">
        <div className="flex h-full flex-col lg:hidden">
          <Marca compacta />
          <Links compacto />
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
          <Marca />
          <Links />
          {rodape}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:hidden">
          <Button variant="outline" size="icon" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">
            <Menu className="size-4" />
          </Button>
          <p className="truncate text-sm font-semibold">{tituloDaRota(location.pathname)}</p>
        </header>
        <main className="min-w-0 flex-1 pb-24 md:pb-0">
          <Outlet />
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
          <ul className="grid grid-cols-5">
            {navInferior.map((link) => {
              const Icon = link.icon
              const ativo = itemAtivo(location.pathname, link.to)
              return (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={cn(
                      'flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground',
                      ativo && 'text-primary',
                    )}
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </NavLink>
                </li>
              )
            })}
            <li>
              <button
                type="button"
                className="flex min-h-14 w-full flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground"
                onClick={() => setMenuAberto(true)}
              >
                <MoreHorizontal className="size-4" />
                Mais
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <Marca />
            <Links onNavigate={() => setMenuAberto(false)} />
            {rodape}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
