import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAtualizarPreco } from '@/features/produtos/hooks/useProdutos'
import type { Produto } from '@/features/produtos/types'
import { mensagemErro } from '@/shared/lib/errors'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

const schema = z.object({
  preco_unitario: z.number().positive('O preço precisa ser maior que zero'),
})

export function EditarPrecoPopover({ produto }: { produto: Produto }) {
  const [aberto, setAberto] = useState(false)
  const form = useForm<{ preco_unitario: number }>({
    resolver: zodResolver(schema),
    values: { preco_unitario: produto.preco_unitario },
  })
  const mutation = useAtualizarPreco()

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Editar preço
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <form
          className="grid gap-2"
          onSubmit={form.handleSubmit((values) =>
            mutation.mutate(
              { id: produto.id, preco: values.preco_unitario },
              {
                onSuccess: () => {
                  toast.success('Preço atualizado')
                  setAberto(false)
                },
                onError: (error) => toast.error(mensagemErro(error)),
              },
            ),
          )}
        >
          <p className="text-sm font-medium">Novo preço</p>
          <p className="text-xs text-muted-foreground">Pedidos já criados continuam com o preço da época.</p>
          <Input type="number" step="0.01" min="0.01" {...form.register('preco_unitario', { valueAsNumber: true })} />
          {form.formState.errors.preco_unitario ? (
            <p className="text-xs text-destructive">{form.formState.errors.preco_unitario.message}</p>
          ) : null}
          <Button type="submit" disabled={mutation.isPending}>
            Salvar
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
