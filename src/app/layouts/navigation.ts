import { CalendarDays, ClipboardList, House, LayoutDashboard, Package, Plus, Users, type LucideIcon } from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

export const navPrincipal: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
]

export const navInferior: NavItem[] = [
  { to: '/', label: 'Início', icon: LayoutDashboard },
  { to: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/pedidos/novo', label: 'Novo', icon: Plus },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
]

export const marca = House

export function itemAtivo(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  if (to === '/pedidos') return pathname === '/pedidos' || /^\/pedidos\/(?!novo$).+/.test(pathname)
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function tituloDaRota(pathname: string) {
  if (pathname === '/') return 'Dashboard'
  if (pathname.startsWith('/clientes/')) return 'Cliente'
  if (pathname.startsWith('/clientes')) return 'Clientes'
  if (pathname.startsWith('/produtos')) return 'Produtos'
  if (pathname.startsWith('/pedidos/novo')) return 'Novo pedido'
  if (pathname.startsWith('/pedidos/')) return 'Pedido'
  if (pathname.startsWith('/pedidos')) return 'Pedidos'
  if (pathname.startsWith('/agenda')) return 'Agenda'
  return 'SmartLar'
}
