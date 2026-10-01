import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNovoPedido } from '@/features/pedidos/novo/novo-pedido-context'

export function RedirecionarNovoPedido() {
  const { abrir } = useNovoPedido()
  const navigate = useNavigate()

  useEffect(() => {
    abrir()
    navigate('/pedidos', { replace: true })
  }, [abrir, navigate])

  return null
}
