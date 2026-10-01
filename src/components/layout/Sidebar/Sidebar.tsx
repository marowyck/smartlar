import { CirclePlus } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { itemAtivo, navPrincipal } from '@/config/navigation'
import { cn } from '@/utils/cn'
import type { SidebarProps } from './Sidebar.types'

export function Sidebar({ compacto = false, onNavigate, onNovoPedido }: SidebarProps) {
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
      <button
        type="button"
        onClick={() => {
          onNavigate?.()
          onNovoPedido()
        }}
        className={cn(
          'mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90',
          compacto && 'px-0',
        )}
      >
        {compacto ? <CirclePlus className="size-4" /> : (
          <>
            Novo pedido
            <CirclePlus className="size-4" />
          </>
        )}
      </button>
    </nav>
  )
}
