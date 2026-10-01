import { MoreHorizontal } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { itemAtivo, navInferior } from '@/config/navigation'
import { routes } from '@/constants/routes'
import { cn } from '@/utils/cn'

export function BottomNav({ onNovoPedido, onMais }: { onNovoPedido: () => void; onMais: () => void }) {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {navInferior.map((link) => {
          const Icon = link.icon
          if (link.to === routes.novoPedido) {
            return (
              <li key={link.to}>
                <button
                  type="button"
                  className="flex min-h-14 w-full flex-row items-center justify-center gap-1 text-[11px] text-muted-foreground"
                  onClick={onNovoPedido}
                >
                  {link.label}
                  <Icon className="size-4" />
                </button>
              </li>
            )
          }
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
            onClick={onMais}
          >
            <MoreHorizontal className="size-4" />
            Mais
          </button>
        </li>
      </ul>
    </nav>
  )
}
