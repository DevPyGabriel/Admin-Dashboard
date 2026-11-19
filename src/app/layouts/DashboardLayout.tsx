import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Menu } from 'lucide-react'
import { useAuthSession } from '@/features/auth/hooks/useAuthSession'
import { supabase } from '@/lib/supabase/client'
import { Sidebar } from './Sidebar'
import { navigation } from './navigation'

/** Authenticated app shell: persistent rail on desktop, slide-in drawer on mobile. */
export default function DashboardLayout() {
  const { pathname } = useLocation()
  const { user } = useAuthSession()
  // Tying the drawer to its route closes it automatically on navigation,
  // including browser back/forward, without an extra render in an effect.
  const [openForPath, setOpenForPath] = useState<string | null>(null)
  const menuOpen = openForPath === pathname
  const setMenuOpen = (open: boolean) => setOpenForPath(open ? pathname : null)

  const current = navigation.find((item) => item.to === pathname)
  const email = user?.email ?? '—'
  const initial = email.charAt(0).toUpperCase()

  return (
    <div className="bg-canvas min-h-screen lg:pl-60">
      <aside className="border-border bg-sidebar fixed inset-y-0 left-0 z-20 hidden w-60 border-r lg:block">
        <Sidebar compact email={email} onSignOut={() => void supabase.auth.signOut()} />
      </aside>

      <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 bg-overlay fixed inset-0 z-40 duration-200 lg:hidden" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="border-border bg-sidebar shadow-popover data-open:animate-in data-open:slide-in-from-left-4 data-closed:animate-out data-closed:slide-out-to-left-4 fixed inset-y-0 left-0 z-50 flex w-[17.5rem] max-w-[85vw] flex-col border-r duration-200 outline-none lg:hidden"
          >
            <DialogPrimitive.Title className="sr-only">Navegación principal</DialogPrimitive.Title>
            <Sidebar
              email={email}
              onNavigate={() => setMenuOpen(false)}
              onSignOut={() => {
                setMenuOpen(false)
                void supabase.auth.signOut()
              }}
            />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>

        <header className="bg-topbar border-border sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 sm:px-6">
          <DialogPrimitive.Trigger asChild>
            <button
              type="button"
              aria-label="Abrir menú"
              className="focus-visible:ring-ring hover:bg-surface-muted/40 flex size-9 shrink-0 items-center justify-center rounded-md transition-colors duration-200 outline-none focus-visible:ring-2 lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </DialogPrimitive.Trigger>

          <div className="flex min-w-0 items-center gap-2 lg:hidden">
            <span className="bg-foreground text-background flex size-6 items-center justify-center rounded text-xs font-bold">
              N
            </span>
            <span className="truncate text-sm font-semibold">NovaDrive</span>
          </div>

          <div className="hidden min-w-0 lg:block">
            <p className="text-muted-foreground text-xs">Panel</p>
            <p className="truncate text-sm font-medium">{current?.label ?? 'Clientes'}</p>
          </div>

          <div className="ml-auto flex min-w-0 items-center gap-2">
            <span className="text-muted-foreground hidden max-w-48 truncate text-xs sm:block">
              {email}
            </span>
            <div
              className="bg-surface-muted flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              aria-hidden="true"
            >
              {initial}
            </div>
          </div>
        </header>
      </DialogPrimitive.Root>

      <Outlet />
    </div>
  )
}
