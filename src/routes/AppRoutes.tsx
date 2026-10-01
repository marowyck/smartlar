import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { routes } from '@/constants/routes'
import { RedirecionarNovoPedido } from '@/features/pedidos/novo/RedirecionarNovoPedido'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RedirecionarCliente, RedirecionarPedido } from '@/routes/Redirects'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ClientesPage = lazy(() => import('@/features/clientes/pages/ClientesPage').then((m) => ({ default: m.ClientesPage })))
const ProdutosPage = lazy(() => import('@/features/produtos/pages/ProdutosPage').then((m) => ({ default: m.ProdutosPage })))
const PedidosPage = lazy(() => import('@/features/pedidos/pages/PedidosPage').then((m) => ({ default: m.PedidosPage })))
const AgendaPage = lazy(() => import('@/features/agenda/pages/AgendaPage').then((m) => ({ default: m.AgendaPage })))

function Fallback() {
  return (
    <div className="space-y-3 px-4 py-6">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path={routes.login} element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path={routes.clientes.slice(1)} element={<ClientesPage />} />
            <Route path="clientes/:id" element={<RedirecionarCliente />} />
            <Route path={routes.produtos.slice(1)} element={<ProdutosPage />} />
            <Route path={routes.novoPedido.slice(1)} element={<RedirecionarNovoPedido />} />
            <Route path={routes.pedidos.slice(1)} element={<PedidosPage />} />
            <Route path="pedidos/:id" element={<RedirecionarPedido />} />
            <Route path={routes.agenda.slice(1)} element={<AgendaPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={routes.home} replace />} />
      </Routes>
    </Suspense>
  )
}
