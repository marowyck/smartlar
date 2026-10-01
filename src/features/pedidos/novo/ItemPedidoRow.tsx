import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import type { PedidoFormValues } from '@/features/pedidos/schemas'
import type { Produto } from '@/features/produtos/types'
import { calcularSubtotal } from '@/features/pedidos/domain/calculos'
import { formatBRL } from '@/utils/money'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ItemPedidoRow({
  index,
  control,
  errors,
  produtos,
  produtoId,
  quantidade,
  podeRemover,
  onQuantidade,
  onRemover,
}: {
  index: number
  control: Control<PedidoFormValues>
  errors: FieldErrors<PedidoFormValues>
  produtos: Produto[]
  produtoId: string
  quantidade: number
  podeRemover: boolean
  onQuantidade: (valor: number) => void
  onRemover: () => void
}) {
  const preco = produtos.find((produto) => produto.id === produtoId)?.preco_unitario ?? 0

  return (
    <div className="grid gap-3 rounded-xl border p-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
      <div className="grid gap-1.5">
        <Label>Produto</Label>
        <Controller
          control={control}
          name={`itens.${index}.produto_id`}
          render={({ field }) => (
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {produtos.map((produto) => (
                  <SelectItem key={produto.id} value={produto.id}>
                    {produto.nome} · {formatBRL(produto.preco_unitario)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.itens?.[index]?.produto_id ? (
          <p className="text-xs text-destructive">{errors.itens[index]?.produto_id?.message}</p>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-1.5">
          <Label>Qtd.</Label>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" onClick={() => onQuantidade(Math.max(1, quantidade - 1))} aria-label="Diminuir quantidade">
              −
            </Button>
            <span className="w-8 text-center tabular-nums">{quantidade || 0}</span>
            <Button type="button" variant="outline" size="icon" onClick={() => onQuantidade((quantidade || 0) + 1)} aria-label="Aumentar quantidade">
              +
            </Button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Subtotal</p>
          <p className="font-medium tabular-nums">{formatBRL(calcularSubtotal(quantidade || 0, preco))}</p>
        </div>
      </div>
      <Button type="button" variant="ghost" disabled={!podeRemover} onClick={onRemover}>
        Remover
      </Button>
    </div>
  )
}
