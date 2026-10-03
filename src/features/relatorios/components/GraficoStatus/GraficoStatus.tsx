import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { STATUS_LABEL, type StatusPedido } from '@/features/pedidos/domain/status'
import type { PedidoPorStatus } from '@/features/relatorios/types'
import { formatBRL } from '@/utils/money'

const cores: Record<StatusPedido, string> = {
  orcamento: 'var(--status-orcamento)',
  aprovado: 'var(--status-aprovado)',
  agendado: 'var(--status-agendado)',
  em_andamento: 'var(--status-andamento)',
  concluido: 'var(--status-concluido)',
  cancelado: 'var(--status-cancelado)',
}

export function GraficoStatus({ dados }: { dados: PedidoPorStatus[] }) {
  const pontos = dados
    .filter((linha) => linha.quantidade > 0)
    .map((linha) => ({ ...linha, nome: STATUS_LABEL[linha.status] }))

  return (
    <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pontos} dataKey="quantidade" nameKey="nome" innerRadius={48} outerRadius={72} paddingAngle={2}>
              {pontos.map((linha) => (
                <Cell key={linha.status} fill={cores[linha.status]} />
              ))}
            </Pie>
            <Tooltip formatter={(valor, nome) => [valor, nome]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2 text-sm">
        {dados.map((linha) => (
          <li key={linha.status} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: cores[linha.status] }} />
              {STATUS_LABEL[linha.status]}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {linha.quantidade} · {formatBRL(linha.valor)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
