import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePainel } from '@/app/layouts/painel-context'

export function RedirecionarPedido() {
  const { id = '' } = useParams()
  const { abrirPedido } = usePainel()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) abrirPedido(id, 'ver')
    navigate('/pedidos', { replace: true })
  }, [abrirPedido, id, navigate])

  return null
}

export function RedirecionarCliente() {
  const { id = '' } = useParams()
  const { abrirCliente } = usePainel()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) abrirCliente(id, 'ver')
    navigate('/clientes', { replace: true })
  }, [abrirCliente, id, navigate])

  return null
}
