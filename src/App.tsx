import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AgendaPage } from '@/pages/AgendaPage'
import { ClienteDetalhePage } from '@/pages/ClienteDetalhePage'
import { ClientesPage } from '@/pages/ClientesPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { NovoPedidoPage } from '@/pages/NovoPedidoPage'
import { PedidoDetalhePage } from '@/pages/PedidoDetalhePage'
import { PedidosPage } from '@/pages/PedidosPage'
import { ProdutosPage } from '@/pages/ProdutosPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="clientes/:id" element={<ClienteDetalhePage />} />
          <Route path="produtos" element={<ProdutosPage />} />
          <Route path="pedidos/novo" element={<NovoPedidoPage />} />
          <Route path="pedidos" element={<PedidosPage />} />
          <Route path="pedidos/:id" element={<PedidoDetalhePage />} />
          <Route path="agenda" element={<AgendaPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
