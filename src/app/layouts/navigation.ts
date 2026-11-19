import type { LucideIcon } from 'lucide-react'
import { Bell, CreditCard, ReceiptText, Settings2, UsersRound } from 'lucide-react'

export interface NavigationItem {
  label: string
  to: string
  icon: LucideIcon
  /** Upcoming modules are reachable but explicitly marked as not implemented yet. */
  upcoming?: boolean
}

/** Single source of truth for the dashboard navigation and its honest status. */
export const navigation: NavigationItem[] = [
  { label: 'Clientes', to: '/clients', icon: UsersRound },
  { label: 'Suscripciones', to: '/subscriptions', icon: CreditCard, upcoming: true },
  { label: 'Pagos', to: '/payments', icon: ReceiptText, upcoming: true },
  { label: 'Recordatorios', to: '/reminders', icon: Bell, upcoming: true },
  { label: 'Configuración', to: '/settings', icon: Settings2 },
]
