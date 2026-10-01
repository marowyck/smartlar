import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClienteForm } from '@/components/ClienteForm'
import { EmptyState, PageHeader, QueryState } from '@/components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { listarClientes } from '@/lib/api'

export function ClientesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [busca, setBusca] = useState('')
  const clientes = useQuery({
    queryKey: ['clientes', busca],
    queryFn: () => listarClientes(busca),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="O telefone é o WhatsApp. O endereço é onde a instalação vai acontecer."
      />

      <Card>
        <CardHeader>
          <CardTitle>Novo cliente</CardTitle>
          <CardDescription>Cadastre antes de montar o orçamento, ou faça isso na hora do pedido.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClienteForm
            onCreated={(cliente) => {
              void queryClient.invalidateQueries({ queryKey: ['clientes'] })
              navigate(`/clientes/${cliente.id}`)
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por nome ou telefone"
        />
        <QueryState isLoading={clientes.isLoading} error={clientes.error}>
          {clientes.data && clientes.data.length > 0 ? (
            <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Endereço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.data.map((cliente) => (
                    <TableRow
                      key={cliente.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/clientes/${cliente.id}`)}
                    >
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>{cliente.telefone}</TableCell>
                      <TableCell className="max-w-sm truncate">{cliente.endereco}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState>Nenhum cliente encontrado.</EmptyState>
          )}
        </QueryState>
      </div>
    </div>
  )
}
