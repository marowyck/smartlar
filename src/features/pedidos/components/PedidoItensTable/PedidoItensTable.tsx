import { aplicarDesconto, calcularTotal } from '@/features/pedidos/domain/calculos'
import type { PedidoDetalhe } from '@/features/pedidos/types'
import { formatBRL } from '@/utils/money'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function PedidoItensTable({ pedido }: { pedido: PedidoDetalhe }) {
  const somaItens = calcularTotal(
    pedido.itens_pedido.map((item) => ({ quantidade: item.quantidade, precoUnitario: item.preco_unitario })),
  )

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedido.itens_pedido.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>{item.produtos?.nome ?? 'Produto'}</div>
                  <div className="text-xs text-muted-foreground">{item.produtos?.categoria}</div>
                </TableCell>
                <TableCell className="tabular-nums">{item.quantidade}</TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">{formatBRL(item.preco_unitario)}</TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">{formatBRL(item.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            {pedido.desconto > 0 ? (
              <>
                <TableRow>
                  <TableCell colSpan={3}>Subtotal</TableCell>
                  <TableCell className="tabular-nums">{formatBRL(somaItens)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}>Desconto</TableCell>
                  <TableCell className="tabular-nums">{formatBRL(pedido.desconto)}</TableCell>
                </TableRow>
              </>
            ) : null}
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="tabular-nums">{formatBRL(pedido.valor_total)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      {Math.abs(aplicarDesconto(somaItens, pedido.desconto) - pedido.valor_total) > 0.009 ? (
        <p className="text-sm text-destructive">A soma dos itens ({formatBRL(somaItens)}) não bate com o total salvo.</p>
      ) : null}
    </div>
  )
}
