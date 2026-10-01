import { Eye, Pencil } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function BotoesRegistro({
  onVer,
  onEditar,
}: {
  onVer: () => void
  onEditar: () => void
}) {
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
