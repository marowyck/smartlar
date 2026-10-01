import { useState } from 'react'
import { toast } from 'sonner'
import { exigeAgendamento } from '@/features/pedidos/domain/status'
import { useAtualizarPedido } from '@/features/pedidos/hooks/useAtualizarPedido'
import { usePedido } from '@/features/pedidos/hooks/usePedido'
import { mensagemErro } from '@/utils/errors'
import type { FormaPagamento } from '@/utils/money'

export function usePedidoDialog(id: string, aberto: boolean) {
  const pedido = usePedido(aberto ? id : '')
  const atualizar = useAtualizarPedido(id)
  const [agendarAberto, setAgendarAberto] = useState(false)
  const [cancelarAberto, setCancelarAberto] = useState(false)
  const [concluirAberto, setConcluirAberto] = useState(false)
  const [tecnicoId, setTecnicoId] = useState('')
  const [dataLocal, setDataLocal] = useState('')
  const [pagamento, setPagamento] = useState<FormaPagamento>('pix')
  const [observacoes, setObservacoes] = useState<string | null>(null)
  const dados = pedido.data

  function salvar(campos: Parameters<typeof atualizar.mutate>[0]) {
    atualizar.mutate(campos, {
      onSuccess: () => {
        toast.success('Pedido atualizado')
        setAgendarAberto(false)
        setCancelarAberto(false)
        setConcluirAberto(false)
        setObservacoes(null)
      },
      onError: (error) => toast.error(mensagemErro(error)),
    })
  }

  function pedirAgendamento() {
    setTecnicoId(dados?.tecnico_id ?? '')
    setDataLocal('')
    setAgendarAberto(true)
  }

  function confirmarAgenda() {
    if (!tecnicoId || !dataLocal) {
      toast.error('Selecione o técnico e a data de instalação')
      return
    }
    const data = new Date(dataLocal)
    if (Number.isNaN(data.getTime())) {
      toast.error('Data inválida')
      return
    }
    salvar({ status: 'agendado', tecnico_id: tecnicoId, data_instalacao: data.toISOString() })
  }

  return {
    pedido,
    dados,
    atualizar,
    observacoes,
    setObservacoes,
    agendarAberto,
    setAgendarAberto,
    cancelarAberto,
    setCancelarAberto,
    concluirAberto,
    setConcluirAberto,
    tecnicoId,
    setTecnicoId,
    dataLocal,
    setDataLocal,
    pagamento,
    setPagamento,
    salvar,
    pedirAgendamento,
    confirmarAgenda,
    exigeAgendamento,
  }
}
