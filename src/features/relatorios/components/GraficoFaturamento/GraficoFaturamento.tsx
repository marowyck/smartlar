import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { FaturamentoMensal } from '@/features/relatorios/types'
import { formatBRL } from '@/utils/money'

export function GraficoFaturamento({ dados, altura = 260 }: { dados: FaturamentoMensal[]; altura?: number }) {
  const pontos = dados.map((linha) => ({
    ...linha,
    rotulo: format(parseISO(linha.mes), 'MMM', { locale: ptBR }),
  }))

  return (
    <div style={{ height: altura }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={pontos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="rotulo" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis hide />
          <Tooltip
            formatter={(valor) => formatBRL(Number(valor))}
            labelFormatter={(_, payload) => {
              const mes = payload?.[0]?.payload?.mes as string | undefined
              return mes ? format(parseISO(mes), 'MMMM yyyy', { locale: ptBR }) : ''
            }}
          />
          <Bar dataKey="valor_faturado" name="Faturado" fill="var(--primary)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
