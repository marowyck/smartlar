import { Label } from '@/components/ui/label'
import type { FieldProps } from './Field.types'

export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
