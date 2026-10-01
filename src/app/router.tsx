import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/layouts/AppShell'
import { ProtectedRoute } from '@/app/layouts/ProtectedRoute'
import { Skeleton } from '@/shared/ui/skeleton'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ClientesPage = lazy(() => import('@/features/clientes/pages/ClientesPage').then((m) => ({ default: m.ClientesPage })))
const ClienteDetalhePage = lazy(() =>
  import('@/features/clientes/pages/ClienteDetalhePage').then((m) => ({ default: m.ClienteDetalhePage })),
)
const ProdutosPage = lazy(() => import('@/features/produtos/pages/ProdutosPage').then((m) => ({ default: m.ProdutosPage })))
const PedidosPage = lazy(() => import('@/features/pedidos/pages/PedidosPage').then((m) => ({ default: m.PedidosPage })))
const NovoPedidoPage = lazy(() => import('@/features/pedidos/pages/NovoPedidoPage').then((m) => ({ default: m.NovoPedidoPage })))
const PedidoDetalhePage = lazy(() =>
  import('@/features/pedidos/pages/PedidoDetalhePage').then((m) => ({ default: m.PedidoDetalhePage })),
)
const AgendaPage = lazy(() => import('@/features/agenda/pages/AgendaPage').then((m) => ({ default: m.AgendaPage })))

function Fallback() {
  return (
    <div className="space-y-3 px-4 py-6">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
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
    </Suspense>
  )
}
