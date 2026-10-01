import type { Tecnico } from '@/features/agenda/types'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'

export function AgendaFiltros({
  tecnicos,
  tecnicoSelecionado,
  onTecnico,
}: {
  tecnicos: Tecnico[]
  tecnicoSelecionado: string
  onTecnico: (id: string) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Técnico">
        {tecnicos.map((tecnico) => (
          <button
            key={tecnico.id}
            type="button"
            role="tab"
            aria-selected={tecnico.id === tecnicoSelecionado}
            onClick={() => onTecnico(tecnico.id)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm',
              tecnico.id === tecnicoSelecionado ? 'border-primary bg-primary text-primary-foreground' : 'bg-card',
            )}
          >
            {tecnico.nome}
            <span className="ml-2 hidden text-xs opacity-80 sm:inline">{tecnico.especialidade}</span>
          </button>
        ))}
    </div>
  )
}

export function AgendaCalendario({
  dia,
  diasComServico,
  calendarioAberto,
  onDia,
  onCalendario,
}: {
  dia: Date | undefined
  diasComServico: Date[]
  calendarioAberto: boolean
  onDia: (dia: Date | undefined) => void
  onCalendario: () => void
}) {
  return (
    <div className="space-y-3">
      <Button className="xl:hidden" variant="outline" onClick={onCalendario}>
          {calendarioAberto ? 'Ocultar calendário' : 'Mostrar calendário'}
        </Button>
        <Card className={cn(!calendarioAberto && 'hidden xl:block')}>
          <CardContent className="pt-4">
            <Calendar
              mode="single"
              selected={dia}
              onSelect={onDia}
              modifiers={{ ocupado: diasComServico }}
              modifiersClassNames={{ ocupado: 'font-semibold text-primary' }}
            />
            {dia ? (
              <Button variant="ghost" className="mt-2 w-full" onClick={() => onDia(undefined)}>
                Ver todos os dias
              </Button>
            ) : null}
          </CardContent>
        </Card>
    </div>
  )
}
