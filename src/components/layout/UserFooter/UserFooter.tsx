import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UserFooter({ email, onSignOut }: { email?: string; onSignOut: () => void }) {
  return (
    <div className="mt-auto border-t border-sidebar-border p-3">
      <p className="truncate px-2 text-xs text-muted-foreground">{email}</p>
      <Button variant="ghost" className="mt-1 w-full justify-start" onClick={onSignOut}>
        <LogOut className="size-4" />
        Sair
      </Button>
    </div>
  )
}
