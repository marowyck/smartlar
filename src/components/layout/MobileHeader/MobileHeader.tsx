import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MobileHeader({ titulo, onAbrirMenu }: { titulo: string; onAbrirMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:hidden">
      <Button variant="outline" size="icon" onClick={onAbrirMenu} aria-label="Abrir menu">
        <Menu className="size-4" />
      </Button>
      <p className="truncate text-sm font-semibold">{titulo}</p>
    </header>
  )
}
