import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  UsersRound,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ClientService } from '@/features/clients/api/clients.api'
import { ClientFormDialog } from '@/features/clients/components/ClientFormDialog'
import {
  formatServiceAmount,
  getServiceCountdown,
  getServiceState,
  selectServices,
  serviceFilterLabels,
  serviceSortLabels,
  serviceStateLabels,
  type ServiceFilter,
  type ServicePaymentState,
  type ServiceSort,
} from '@/features/clients/lib/client-services'
import {
  useClientServices,
  useDeleteClient,
  useRegisterPayment,
  useUnregisterPayment,
} from '@/features/clients/hooks/useClients'
import { cn } from '@/lib/utils/cn'

interface Notice {
  text: string
  tone: 'success' | 'danger'
}

const stateBadgeTone: Record<ServicePaymentState, string> = {
  paid: 'bg-success-soft text-success-soft-foreground',
  pending: 'bg-warning-soft text-warning-soft-foreground',
  overdue: 'bg-danger-soft text-danger-soft-foreground',
}

const countdownTone: Record<ServicePaymentState, string> = {
  paid: 'text-success',
  pending: 'text-secondary',
  overdue: 'text-danger',
}

const selectClassName =
  'border-border bg-canvas text-foreground h-8 rounded-md border px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

function StateBadge({ state }: { state: ServicePaymentState }) {
  return (
    <Badge className={cn('border-transparent', stateBadgeTone[state])}>
      {serviceStateLabels[state]}
    </Badge>
  )
}

function DueDate({
  service,
  state,
  today,
}: {
  service: ClientService
  state: ServicePaymentState
  today: Date
}) {
  return (
    <div className="min-w-0">
      <p className="tabular-data text-sm">
        {service.dueDate ? format(parseISO(service.dueDate), 'dd/MM/yyyy') : '—'}
      </p>
      <p className={cn('mt-0.5 text-xs', countdownTone[state])}>
        {getServiceCountdown(service, today)}
      </p>
    </div>
  )
}

export default function ClientsPage() {
  const { data: services = [], isLoading, error } = useClientServices()
  const deleteClient = useDeleteClient()
  const registerPayment = useRegisterPayment()
  const unregisterPayment = useUnregisterPayment()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ClientService | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [query, setQuery] = useState('')
  const [date, setDate] = useState('')
  const [filter, setFilter] = useState<ServiceFilter>('all')
  const [sort, setSort] = useState<ServiceSort>('urgency')
  const [today] = useState(() => new Date())

  const visible = useMemo(
    () => selectServices(services, { query, date, filter, sort }, today),
    [services, query, date, filter, sort, today],
  )

  const stats = useMemo(() => {
    const count = (state: ServicePaymentState) =>
      services.filter((service) => getServiceState(service, today) === state).length
    return {
      total: services.length,
      paid: count('paid'),
      pending: count('pending'),
      overdue: count('overdue'),
    }
  }, [services, today])

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (service: ClientService) => {
    setEditing(service)
    setDialogOpen(true)
  }

  const handleDelete = async (service: ClientService) => {
    if (!window.confirm(`¿Eliminar a "${service.clientName}"?`)) return

    setNotice(null)
    try {
      await deleteClient.mutateAsync(service.clientId)
      setNotice({ text: 'Cliente eliminado correctamente.', tone: 'success' })
    } catch (deleteError) {
      setNotice({
        text: deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el cliente',
        tone: 'danger',
      })
    }
  }

  const handleTogglePayment = async (service: ClientService) => {
    setNotice(null)
    const state = getServiceState(service, today)

    try {
      if (state === 'paid') {
        const payment = service.payments.find((item) => item.status === 'paid')
        if (!payment) return
        await unregisterPayment.mutateAsync(payment.id)
        setNotice({ text: 'El servicio volvió a estar sin pagar.', tone: 'success' })
      } else {
        await registerPayment.mutateAsync(service)
        setNotice({ text: 'Pago registrado correctamente.', tone: 'success' })
      }
    } catch (paymentError) {
      setNotice({
        text:
          paymentError instanceof Error ? paymentError.message : 'No se pudo actualizar el pago',
        tone: 'danger',
      })
    }
  }

  const clearFilters = () => {
    setQuery('')
    setDate('')
    setFilter('all')
    setSort('urgency')
  }

  const statsCards = [
    { label: 'Servicios', value: stats.total, icon: UsersRound, tone: 'text-foreground' },
    { label: 'Pagados', value: stats.paid, icon: CheckCircle2, tone: 'text-success' },
    { label: 'Pendientes', value: stats.pending, icon: Clock3, tone: 'text-warning' },
    { label: 'Por cobrar', value: stats.overdue, icon: AlertCircle, tone: 'text-danger' },
  ]

  return (
    <main className="page-container py-6 sm:py-8">
      <div className="space-y-6">
        <PageHeader
          title="Clientes"
          description="Administra tus servicios, cobros y fechas de vencimiento."
          actions={
            <Button variant="white" size="sm" onClick={openCreate}>
              Nuevo cliente
            </Button>
          }
        />

        {notice && (
          <p
            role="status"
            className={cn('text-sm', notice.tone === 'danger' ? 'text-danger' : 'text-success')}
          >
            {notice.text}
          </p>
        )}
        {error && (
          <p className="text-danger text-sm" role="alert">
            {error.message}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statsCards.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="surface-panel flex items-center gap-3 p-3">
              <Icon className={cn('size-4 shrink-0', tone)} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-secondary truncate text-xs">{label}</p>
                <p className="tabular-data text-lg leading-tight font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="surface-panel p-3" aria-label="Filtros de clientes">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar cliente, servicio o estado"
                aria-label="Buscar cliente, servicio o estado"
                className="pl-8 text-[13px] placeholder:text-neutral-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="text-secondary size-4 shrink-0" aria-hidden="true" />
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                aria-label="Filtrar por fecha de vencimiento"
                className="w-full sm:w-44"
              />
              {date && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Quitar filtro de fecha"
                  onClick={() => setDate('')}
                >
                  <X aria-hidden="true" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 lg:ml-auto">
              <label htmlFor="service-sort" className="text-secondary text-xs">
                Ordenar
              </label>
              <select
                id="service-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as ServiceSort)}
                className={selectClassName}
              >
                {(Object.keys(serviceSortLabels) as ServiceSort[]).map((key) => (
                  <option key={key} value={key}>
                    {serviceSortLabels[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className="border-border mt-3 flex flex-wrap gap-2 border-t pt-3"
            role="group"
            aria-label="Filtros rápidos"
          >
            {(Object.keys(serviceFilterLabels) as ServiceFilter[]).map((key) => (
              <Button
                key={key}
                type="button"
                size="xs"
                variant={filter === key ? 'default' : 'outline'}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              >
                {serviceFilterLabels[key]}
              </Button>
            ))}
          </div>
        </section>

        <section className="surface-panel overflow-hidden" aria-label="Listado de clientes">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Listado</h2>
            <span className="text-secondary tabular-data text-xs">
              {visible.length} de {services.length}{' '}
              {services.length === 1 ? 'servicio' : 'servicios'}
            </span>
          </div>

          {isLoading ? (
            <p className="text-secondary p-6 text-sm">Cargando…</p>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <UsersRound className="text-secondary size-5" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium">Aún no hay clientes</p>
              <p className="text-secondary mt-1 text-xs">Crea el primero con «Nuevo cliente».</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <Search className="text-secondary size-5" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium">Sin resultados</p>
              <p className="text-secondary mt-1 text-xs">
                Prueba con otra búsqueda o quita los filtros.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={clearFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <>
              {/* Phone: one card per service, with the actions inside thumb reach. */}
              <ul className="divide-border divide-y md:hidden">
                {visible.map((service) => {
                  const state = getServiceState(service, today)
                  return (
                    <li key={service.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{service.clientName}</p>
                          <p className="text-secondary truncate text-xs">
                            {service.email || 'Sin correo'}
                          </p>
                        </div>
                        <StateBadge state={state} />
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div className="min-w-0">
                          <dt className="text-secondary">Servicio</dt>
                          <dd className="truncate">{service.serviceType}</dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-secondary">Monto</dt>
                          <dd className="tabular-data truncate">{formatServiceAmount(service)}</dd>
                        </div>
                        <div className="col-span-2 min-w-0">
                          <dt className="text-secondary">Vencimiento</dt>
                          <dd>
                            <DueDate service={service} state={state} today={today} />
                          </dd>
                        </div>
                        {service.description && (
                          <div className="col-span-2 min-w-0">
                            <dt className="text-secondary">Descripción</dt>
                            <dd className="break-words whitespace-pre-wrap">
                              {service.description}
                            </dd>
                          </div>
                        )}
                      </dl>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEdit(service)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => void handleTogglePayment(service)}
                        >
                          {state === 'paid' ? 'Marcar sin pagar' : 'Marcar pagado'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive flex-1"
                          onClick={() => void handleDelete(service)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {/* Desktop: dense table, same data and the same handlers. */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((service) => {
                      const state = getServiceState(service, today)
                      return (
                        <TableRow key={service.id}>
                          <TableCell>
                            <div className="min-w-0">
                              <p className="font-medium">{service.clientName}</p>
                              <p className="text-secondary truncate text-xs">
                                {service.email || 'Sin correo'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <p>{service.serviceType}</p>
                              {service.description && (
                                <p className="text-secondary max-w-48 truncate text-xs">
                                  {service.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DueDate service={service} state={state} today={today} />
                          </TableCell>
                          <TableCell className="tabular-data whitespace-nowrap">
                            {formatServiceAmount(service)}
                          </TableCell>
                          <TableCell>
                            <StateBadge state={state} />
                          </TableCell>
                          <TableCell className="space-x-2 text-right whitespace-nowrap">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(service)}>
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleTogglePayment(service)}
                            >
                              {state === 'paid' ? 'Sin pagar' : 'Marcar pagado'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => void handleDelete(service)}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </section>
      </div>

      {dialogOpen && (
        <ClientFormDialog
          key={editing?.id ?? 'new'}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          service={editing}
        />
      )}
    </main>
  )
}
