import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function ClientePicker({
  clientes,
  value,
  onChange,
}: {
  clientes: { id: string; nome: string; telefone: string }[]
  value: string
  onChange: (id: string) => void
}) {
  const [aberto, setAberto] = useState(false)
  const selecionado = clientes.find((cliente) => cliente.id === value)

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between">
          {selecionado ? `${selecionado.nome} · ${selecionado.telefone}` : 'Selecionar cliente'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar por nome ou telefone" />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            <CommandGroup>
              {clientes.map((cliente) => (
                <CommandItem
                  key={cliente.id}
                  value={`${cliente.nome} ${cliente.telefone}`}
                  onSelect={() => {
                    onChange(cliente.id)
                    setAberto(false)
                  }}
                >
                  <span>{cliente.nome}</span>
                  <span className="text-muted-foreground">{cliente.telefone}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
