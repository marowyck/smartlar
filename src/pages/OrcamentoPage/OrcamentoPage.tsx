import { addDays, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useParams } from 'react-router-dom'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { appConfig } from '@/config/app'
import { usePedido } from '@/features/pedidos/hooks/usePedido'
import { formatBRL, labelFormaPagamento, numeroPedido } from '@/utils/money'
import { Button } from '@/components/ui/button'

export function OrcamentoPage() {
  const { id = '' } = useParams()
  const pedido = usePedido(id)
  const dados = pedido.data

  return (
    <main className="mx-auto min-h-svh max-w-3xl bg-white px-6 py-10 text-neutral-900 print:px-0">
      <div className="mb-8 flex items-start justify-between gap-4 print:hidden">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          Salvar PDF
        </Button>
      </div>
      <QueryBoundary isLoading={pedido.isLoading} error={pedido.error} onRetry={() => void pedido.refetch()}>
        {dados ? (
          <article className="space-y-8">
            <header className="flex items-end justify-between border-b border-neutral-200 pb-4">
              <div>
                <p className="text-2xl font-semibold">{appConfig.nome}</p>
                <p className="text-sm text-neutral-500">Automação residencial</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">Orçamento {numeroPedido(dados.numero)}</p>
                <p>Emitido em {format(parseISO(dados.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                <p>Válido até {format(addDays(parseISO(dados.created_at), 15), 'dd/MM/yyyy')}</p>
              </div>
            </header>
            <section className="text-sm">
              <p className="font-medium">{dados.clientes?.nome}</p>
              <p>{dados.clientes?.telefone}</p>
              <p>{dados.clientes?.endereco}</p>
            </section>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium">Qtd.</th>
                  <th className="py-2 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {dados.itens_pedido.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100">
                    <td className="py-2">{item.produtos?.nome ?? 'Produto'}</td>
                    <td className="py-2 tabular-nums">{item.quantidade}</td>
                    <td className="py-2 text-right tabular-nums">{formatBRL(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
              {dados.desconto > 0 ? (
                <>
                  <p className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{formatBRL(dados.itens_pedido.reduce((soma, item) => soma + item.subtotal, 0))}</span></p>
                  <p className="flex justify-between"><span>Desconto</span><span className="tabular-nums">{formatBRL(dados.desconto)}</span></p>
                </>
              ) : null}
              <p className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatBRL(dados.valor_total)}</span>
              </p>
              <p className="text-neutral-500">Pagamento: {labelFormaPagamento(dados.forma_pagamento)}</p>
            </div>
            {dados.observacoes ? <p className="text-sm">Observações: {dados.observacoes}</p> : null}
          </article>
        ) : null}
      </QueryBoundary>
    </main>
  )
}
