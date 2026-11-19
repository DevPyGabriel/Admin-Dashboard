import { NavLink } from 'react-router'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { navigation } from './navigation'

interface SidebarProps {
  /** Compact density for the persistent desktop rail. */
  compact?: boolean
  email?: string
  onNavigate?: () => void
  onSignOut?: () => void
}

/** Shared sidebar content for the desktop rail and the mobile drawer. */
export function Sidebar({ compact = false, email, onNavigate, onSignOut }: SidebarProps) {
  const initial = email?.charAt(0).toUpperCase() ?? 'N'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          'border-border flex shrink-0 items-center gap-2.5 border-b px-4',
          compact ? 'h-14' : 'h-16',
        )}
      >
        <div className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md text-sm font-bold">
          N
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm leading-tight font-semibold">NovaDrive</p>
          <p className="text-muted-foreground truncate text-[11px] leading-tight">
            Panel de suscripciones
          </p>
        </div>
      </div>

      <nav
        aria-label="Navegación principal"
        className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-2 py-4"
      >
        <p className="text-muted-foreground mb-2 px-2 text-[10px] font-semibold tracking-wider uppercase">
          General
        </p>
        <ul className="space-y-0.5">
          {navigation.map(({ label, to, icon: Icon, upcoming }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-transparent',
                    'relative flex items-center gap-2.5 rounded-md px-2.5 text-sm outline-none',
                    'hover:bg-surface-muted focus-visible:ring-ring focus-visible:ring-2',
                    compact ? 'h-9' : 'h-11',
                    isActive
                      ? 'bg-nav-active text-nav-active-foreground before:bg-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {upcoming && (
                  <span className="text-muted-foreground bg-surface-muted shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium">
                    Pronto
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="safe-bottom border-border shrink-0 border-t p-2">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="bg-surface-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">Operador</p>
            <p className="text-muted-foreground truncate text-[11px]" title={email}>
              {email ?? '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:ring-ring flex size-9 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-2"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
