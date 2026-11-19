import { Link, useLocation } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { navigation } from './navigation'

/** Honest empty screen for modules that are in the navigation but not built yet. */
export default function PlaceholderPage() {
  const { pathname } = useLocation()
  const item = navigation.find((entry) => entry.to === pathname)
  const Icon = item?.icon

  return (
    <main className="page-container py-6 sm:py-8">
      <PageHeader title={item?.label ?? 'Módulo'} description="Sección del panel de NovaDrive." />

      <section className="surface-panel mt-6 flex flex-col items-center px-6 py-14 text-center">
        <div className="bg-primary-soft text-primary-soft-foreground flex size-10 items-center justify-center rounded-lg">
          {Icon && <Icon className="size-5" aria-hidden="true" />}
        </div>
        <h2 className="mt-4 text-base font-semibold">Próximamente</h2>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          Este módulo todavía no está disponible. Clientes ya funciona y puedes seguir probando el
          CRUD allí.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-5">
          <Link to="/clients">
            Ir a Clientes
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </main>
  )
}
