import { CalendarDays, CirclePlus, ClipboardList, LayoutDashboard, Package, Users, type LucideIcon } from 'lucide-react'
import { routes } from '@/constants/routes'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

export const navPrincipal: NavItem[] = [
  { to: routes.home, label: 'Dashboard', icon: LayoutDashboard },
  { to: routes.pedidos, label: 'Pedidos', icon: ClipboardList },
  { to: routes.clientes, label: 'Clientes', icon: Users },
  { to: routes.produtos, label: 'Produtos', icon: Package },
  { to: routes.agenda, label: 'Agenda', icon: CalendarDays },
]

export const navInferior: NavItem[] = [
  { to: routes.home, label: 'Início', icon: LayoutDashboard },
  { to: routes.pedidos, label: 'Pedidos', icon: ClipboardList },
  { to: routes.novoPedido, label: 'Novo', icon: CirclePlus },
  { to: routes.agenda, label: 'Agenda', icon: CalendarDays },
]

export function itemAtivo(pathname: string, to: string) {
  if (to === routes.home) return pathname === routes.home
  if (to === routes.pedidos) return pathname === routes.pedidos || /^\/pedidos\/(?!novo$).+/.test(pathname)
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function tituloDaRota(pathname: string) {
  if (pathname === routes.home) return 'Dashboard'
  if (pathname.startsWith(`${routes.clientes}/`)) return 'Cliente'
  if (pathname.startsWith(routes.clientes)) return 'Clientes'
  if (pathname.startsWith(routes.produtos)) return 'Produtos'
  if (pathname.startsWith(routes.novoPedido)) return 'Novo pedido'
  if (pathname.startsWith(`${routes.pedidos}/`)) return 'Pedido'
  if (pathname.startsWith(routes.pedidos)) return 'Pedidos'
  if (pathname.startsWith(routes.agenda)) return 'Agenda'
  return 'SmartLar'
}
