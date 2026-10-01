import type { ReactNode } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export function MobileMenu({
  aberto,
  onOpenChange,
  children,
}: {
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  children: ReactNode
}) {
  return (
    <Sheet open={aberto} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
