import { CirclePlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { usePainel } from '@/app/layouts/painel-context'
import { BotoesRegistro } from '@/shared/components/BotoesRegistro'
import { ClienteForm } from '@/features/clientes/components/ClienteForm'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { EmptyState } from '@/shared/components/EmptyState'
import { Initials } from '@/shared/components/Initials'
import { PageContainer, PageHeader } from '@/shared/components/PageHeader'
import { QueryBoundary } from '@/shared/components/QueryBoundary'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function ClientesPage() {
  const { abrirCliente } = usePainel()
  const [busca, setBusca] = useState('')
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const termo = useDebouncedValue(busca, 300)
  const clientes = useClientes(termo)

  return (
    <PageContainer>
      <PageHeader
        title="Clientes"
        description="O telefone é o WhatsApp. O endereço é onde a instalação vai acontecer."
        action={
          <Button onClick={() => setCadastroAberto(true)}>
            Novo cliente
            <CirclePlus data-icon="inline-end" />
          </Button>
        }
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por nome ou telefone"
          aria-label="Buscar clientes"
          className="sm:max-w-sm"
        />
        <p className="text-sm text-muted-foreground">{clientes.data ? `${clientes.data.length} cliente(s)` : ' '}</p>
      </div>
      <QueryBoundary isLoading={clientes.isLoading} error={clientes.error} onRetry={() => void clientes.refetch()}>
        {clientes.data && clientes.data.length > 0 ? (
          <>
            <ul className="space-y-3 md:hidden">
              {clientes.data.map((cliente) => (
                <li key={cliente.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl bg-card p-4 text-left shadow-sm ring-1 ring-foreground/10"
                    onClick={() => abrirCliente(cliente.id, 'ver')}
                  >
                    <Initials name={cliente.nome} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{cliente.nome}</span>
                      <span className="block text-sm text-muted-foreground">{cliente.telefone}</span>
                      <span className="block truncate text-sm text-muted-foreground">{cliente.endereco}</span>
                      <BotoesRegistro onVer={() => abrirCliente(cliente.id, 'ver')} onEditar={() => abrirCliente(cliente.id, 'editar')} />
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
                  {clientes.data.map((cliente) => (
                    <TableRow key={cliente.id} className="cursor-pointer" onClick={() => abrirCliente(cliente.id, 'ver')}>
                      <TableCell>
                        <span className="flex items-center gap-3 font-medium">
                          <Initials name={cliente.nome} />
                          {cliente.nome}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{cliente.telefone}</TableCell>
                      <TableCell className="max-w-md truncate">{cliente.endereco}</TableCell>
                      <TableCell>
                        <BotoesRegistro onVer={() => abrirCliente(cliente.id, 'ver')} onEditar={() => abrirCliente(cliente.id, 'editar')} />
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

      <Dialog open={cadastroAberto} onOpenChange={setCadastroAberto}>
        <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
            <DialogDescription>Cadastre antes do orçamento, ou faça isso na hora do pedido.</DialogDescription>
          </DialogHeader>
          <ClienteForm
            onCreated={() => {
              toast.success('Cliente cadastrado')
              setCadastroAberto(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
