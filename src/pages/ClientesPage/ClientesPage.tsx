import { CirclePlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ClienteForm } from '@/features/clientes/components/ClienteForm'
import { ClientesList } from '@/features/clientes/components/ClientesList'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { usePainel } from '@/store/painel-context'

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
      <ClientesList
        clientes={clientes.data ?? []}
        isLoading={clientes.isLoading}
        error={clientes.error}
        onRetry={() => void clientes.refetch()}
        onAbrir={abrirCliente}
      />

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
