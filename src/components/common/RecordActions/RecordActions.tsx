import { Eye, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RecordActionsProps } from './RecordActions.types'

export function RecordActions({ onVer, onEditar }: RecordActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Visualizar"
        onClick={(event) => {
          event.stopPropagation()
          onVer()
        }}
      >
        <Eye />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Editar"
        onClick={(event) => {
          event.stopPropagation()
          onEditar()
        }}
      >
        <Pencil />
      </Button>
    </div>
  )
}
