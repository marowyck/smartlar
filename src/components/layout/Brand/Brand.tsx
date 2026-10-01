import { House } from 'lucide-react'
import { appConfig } from '@/config/app'
import { cn } from '@/utils/cn'

export function Brand({ compacta = false }: { compacta?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 px-3 py-4', compacta && 'justify-center px-2')}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <House className="size-4" />
      </span>
      {compacta ? null : (
        <div>
          <p className="text-sm font-semibold leading-none">{appConfig.nome}</p>
          <p className="mt-1 text-xs text-muted-foreground">Instalações</p>
        </div>
      )}
    </div>
  )
}
