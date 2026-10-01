import { EmptyState } from '@/components/common/EmptyState'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { StatusBadge } from '@/features/pedidos/components/StatusBadge'
import type { ProximaInstalacao } from '@/features/dashboard/types'
import { agruparPorDia } from '@/features/dashboard/utils/agruparPorDia'
import { formatDataHora } from '@/utils/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProximasInstalacoes({
  instalacoes,
  isLoading,
  error,
  onRetry,
  onAbrir,
}: {
  instalacoes: ProximaInstalacao[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
  onAbrir: (id: string) => void
}) {
  const grupos = agruparPorDia(instalacoes)

  return (
    <section className="space-y-3 2xl:col-span-2">
      <h2 className="text-lg font-semibold">Próximas instalações</h2>
      <p className="text-sm text-muted-foreground">Agendadas e em andamento nos próximos 7 dias.</p>
      <QueryBoundary isLoading={isLoading} error={error} onRetry={onRetry}>
        {grupos.length > 0 ? (
          <div className="space-y-4">
            {grupos.map((grupo) => (
              <Card key={grupo.chave}>
                <CardHeader>
                  <CardTitle className="capitalize">{grupo.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {grupo.itens.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="flex w-full flex-col gap-1 rounded-xl border p-3 text-left hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                      onClick={() => onAbrir(item.id)}
                    >
                      <span>
                        <span className="block font-medium">{item.cliente_nome}</span>
                        <span className="block text-sm text-muted-foreground">{formatDataHora(item.data_instalacao)}</span>
                        <span className="block break-words text-sm">{item.endereco}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <StatusBadge status={item.status} />
                        <span className="text-sm text-muted-foreground">{item.tecnico_nome ?? '—'}</span>
                      </span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhuma instalação nos próximos 7 dias" />
        )}
      </QueryBoundary>
    </section>
  )
}
