import { EmptyState } from '@/components/common/EmptyState'
import { Initials } from '@/components/common/Initials'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { RecordActions } from '@/components/common/RecordActions'
import type { Cliente } from '@/features/clientes/types'
import type { ModoPainel } from '@/store/painel-context'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function ClientesList({
  clientes,
  isLoading,
  error,
  onRetry,
  onAbrir,
}: {
  clientes: Cliente[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
  onAbrir: (id: string, modo: ModoPainel) => void
}) {
  return (
    <QueryBoundary isLoading={isLoading} error={error} onRetry={onRetry}>
      {clientes.length > 0 ? (
        <>
          <ul className="space-y-3 md:hidden">
            {clientes.map((cliente) => (
              <li key={cliente.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl bg-card p-4 text-left shadow-sm ring-1 ring-foreground/10"
                  onClick={() => onAbrir(cliente.id, 'ver')}
                >
                  <Initials name={cliente.nome} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{cliente.nome}</span>
                    <span className="block text-sm text-muted-foreground">{cliente.telefone}</span>
                    <span className="block truncate text-sm text-muted-foreground">{cliente.endereco}</span>
                    <RecordActions onVer={() => onAbrir(cliente.id, 'ver')} onEditar={() => onAbrir(cliente.id, 'editar')} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-foreground/10 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id} className="cursor-pointer" onClick={() => onAbrir(cliente.id, 'ver')}>
                    <TableCell>
                      <span className="flex items-center gap-3 font-medium">
                        <Initials name={cliente.nome} />
                        {cliente.nome}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{cliente.telefone}</TableCell>
                    <TableCell className="max-w-md truncate">{cliente.endereco}</TableCell>
                    <TableCell>
                      <RecordActions onVer={() => onAbrir(cliente.id, 'ver')} onEditar={() => onAbrir(cliente.id, 'editar')} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <EmptyState title="Nenhum cliente encontrado" description="Ajuste a busca ou cadastre um cliente novo." />
      )}
    </QueryBoundary>
  )
}
