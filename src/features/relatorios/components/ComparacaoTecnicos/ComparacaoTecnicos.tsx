import type { DesempenhoTecnico } from '@/features/relatorios/types'
import { formatBRL } from '@/utils/money'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ComparacaoTecnicos({ tecnicos }: { tecnicos: DesempenhoTecnico[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {tecnicos.map((tecnico) => (
        <Card key={tecnico.id}>
          <CardHeader>
            <CardTitle>{tecnico.nome}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-muted-foreground">{tecnico.especialidade}</p>
            <p>
              <span className="text-muted-foreground">Concluídas no mês: </span>
              {tecnico.concluidas_mes}
            </p>
            <p>
              <span className="text-muted-foreground">Faturado no mês: </span>
              {formatBRL(tecnico.faturado_mes)}
            </p>
            <p>
              <span className="text-muted-foreground">Carga da semana: </span>
              {tecnico.carga_semana}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
