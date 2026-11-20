import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import {
  AlertCircle,
  Car,
  CheckCircle2,
  Clock3,
  Package,
  Plus,
  Search,
  Trash2,
  Truck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
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
  serviceTypeLabels,
  serviceTypes,
  type ServiceType,
} from '@/features/clients/schemas/client.schema'
import {
  useClientServices,
  useDeleteClient,
  useDeleteClientService,
  useRegisterPayment,
  useUnregisterPayment,
} from '@/features/clients/hooks/useClients'
import { cn } from '@/lib/utils/cn'

interface Notice {
  text: string
  tone: 'success' | 'danger'
}

interface ClientGroup {
  id: string
  name: string
  email: string | null
  services: ClientService[]
}

interface DialogState {
  anchor: ClientService | null
  clientServices: ClientService[]
  addService: boolean
}

const stateBadgeTone: Record<ServicePaymentState, string> = {
  paid: 'bg-success-soft text-success-soft-foreground',
  pending: 'bg-warning-soft text-warning-soft-foreground',
  overdue: 'bg-danger-soft text-danger-soft-foreground',
}

const stateBadgeVariant: Record<ServicePaymentState, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
}

const serviceTypeTone: Record<ServiceType, string> = {
  transporte: 'bg-info-soft text-info-soft-foreground',
  taxi: 'bg-warning-soft text-warning-soft-foreground',
  delivery: 'bg-primary-soft text-primary-soft-foreground',
}

const serviceTypeIcon: Record<ServiceType, LucideIcon> = {
  transporte: Truck,
  taxi: Car,
  delivery: Package,
}

function ServiceTypeTag({ type }: { type: string }) {
  const normalized = serviceTypes.find((item) => item === type)

  if (!normalized) {
    return <Badge variant="outline">{type}</Badge>
  }

  const Icon = serviceTypeIcon[normalized]
  return (
    <Badge className={cn('border-transparent', serviceTypeTone[normalized])}>
      <Icon aria-hidden="true" />
      {serviceTypeLabels[normalized]}
    </Badge>
  )
}

function StateBadge({ state }: { state: ServicePaymentState }) {
  return <Badge variant={stateBadgeVariant[state]}>{serviceStateLabels[state]}</Badge>
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
    <div className="min-w-0 space-y-2">
      <p className="tabular-data text-sm font-semibold">
        {service.dueDate ? format(parseISO(service.dueDate), 'dd/MM/yyyy') : '—'}
      </p>
      <span
        className={cn(
          'inline-flex max-w-full rounded-md px-2 py-1 text-xs leading-4 font-medium',
          stateBadgeTone[state],
        )}
      >
        {getServiceCountdown(service, today)}
      </span>
    </div>
  )
}

function groupByClient(services: ClientService[]): ClientGroup[] {
  const groups = new Map<string, ClientGroup>()
  services.forEach((service) => {
    const group = groups.get(service.clientId)
    if (group) {
      group.services.push(service)
      return
    }
    groups.set(service.clientId, {
      id: service.clientId,
      name: service.clientName,
      email: service.email,
      services: [service],
    })
  })
  return Array.from(groups.values())
}

export default function ClientsPage() {
  const { data: services = [], isLoading, error } = useClientServices()
  const deleteClient = useDeleteClient()
  const deleteService = useDeleteClientService()
  const registerPayment = useRegisterPayment()
  const unregisterPayment = useUnregisterPayment()

  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ServiceFilter>('all')
  const [sort, setSort] = useState<ServiceSort>('urgency')
  const [today] = useState(() => new Date())

  const visible = useMemo(
    () => selectServices(services, { query, date: '', filter, sort }, today),
    [services, query, filter, sort, today],
  )
  const groups = useMemo(() => groupByClient(visible), [visible])

  const stats = useMemo(() => {
    const count = (state: ServicePaymentState) =>
      services.filter((service) => getServiceState(service, today) === state).length
    return {
      total: services.length,
      clients: new Set(services.map((service) => service.clientId)).size,
      paid: count('paid'),
      pending: count('pending'),
      overdue: count('overdue'),
    }
  }, [services, today])

  const openCreate = () => setDialog({ anchor: null, clientServices: [], addService: false })

  const openEdit = (group: ClientGroup) =>
    setDialog({
      anchor: group.services[0],
      clientServices: group.services,
      addService: false,
    })

  const openAddService = (group: ClientGroup) =>
    setDialog({
      anchor: group.services[0],
      clientServices: group.services,
      addService: true,
    })

  const handleDelete = async (group: ClientGroup) => {
    const detail = group.services.length > 1 ? ` y sus ${group.services.length} servicios` : ''
    if (!window.confirm(`¿Eliminar a "${group.name}"${detail}?`)) return

    setNotice(null)
    try {
      await deleteClient.mutateAsync(group.id)
      setNotice({ text: 'Cliente y servicios eliminados correctamente.', tone: 'success' })
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
        await unregisterPayment.mutateAsync(service)
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

  const handleDeleteService = async (service: ClientService) => {
    if (
      !window.confirm(`¿Eliminar el servicio ${service.serviceType} de "${service.clientName}"?`)
    ) {
      return
    }

    setNotice(null)
    try {
      await deleteService.mutateAsync(service)
      setNotice({ text: 'Servicio eliminado correctamente.', tone: 'success' })
    } catch (serviceError) {
      setNotice({
        text:
          serviceError instanceof Error ? serviceError.message : 'No se pudo eliminar el servicio',
        tone: 'danger',
      })
    }
  }

  const clearFilters = () => {
    setQuery('')
    setFilter('all')
    setSort('urgency')
  }

  const statsCards: Array<{
    label: string
    value: number
    icon: LucideIcon
    tone: string
    className?: string
  }> = [
    { label: 'Clientes', value: stats.clients, icon: UsersRound, tone: 'text-foreground' },
    { label: 'Servicios', value: stats.total, icon: Package, tone: 'text-primary' },
    { label: 'Pagados', value: stats.paid, icon: CheckCircle2, tone: 'text-success' },
    { label: 'Pendientes', value: stats.pending, icon: Clock3, tone: 'text-warning' },
    {
      label: 'Por cobrar',
      value: stats.overdue,
      icon: AlertCircle,
      tone: 'text-danger',
      className: 'col-span-2',
    },
  ]

  return (
    <main className="page-container py-6 sm:py-8">
      <div className="space-y-6">
        <PageHeader
          title="Clientes"
          description="Cada cliente puede tener varios servicios con monto, vencimiento y estado propios."
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
          {statsCards.map(({ label, value, icon: Icon, tone, className }) => (
            <div key={label} className={cn('surface-panel flex items-center gap-3 p-3', className)}>
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
                className="pl-8 text-[13px]"
              />
            </div>

            <div className="flex items-center gap-2 lg:ml-auto">
              <label htmlFor="service-sort" className="text-secondary text-xs">
                Ordenar
              </label>
              <Select
                id="service-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as ServiceSort)}
                className="w-auto text-[13px]"
              >
                {(Object.keys(serviceSortLabels) as ServiceSort[]).map((key) => (
                  <option key={key} value={key}>
                    {serviceSortLabels[key]}
                  </option>
                ))}
              </Select>
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
              {groups.length} de {stats.clients} clientes · {visible.length} servicios
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
          ) : groups.length === 0 ? (
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
              {/* Phone: one card per client, every service keeps its own state. */}
              <ul className="divide-border divide-y md:hidden">
                {groups.map((group) => (
                  <li key={group.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate font-medium" title={group.name}>
                          {group.name}
                        </p>
                        <p
                          className="text-secondary truncate text-xs"
                          title={group.email ?? undefined}
                        >
                          {group.email || 'Sin correo'} · {group.services.length}{' '}
                          {group.services.length === 1 ? 'servicio' : 'servicios'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Agregar servicio a ${group.name}`}
                        onClick={() => openAddService(group)}
                      >
                        <Plus aria-hidden="true" />
                      </Button>
                    </div>

                    <ul className="divide-border border-border/70 divide-y rounded-lg border">
                      {group.services.map((service) => {
                        const state = getServiceState(service, today)
                        return (
                          <li key={service.id} className="space-y-3 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <ServiceTypeTag type={service.serviceType} />
                              <StateBadge state={state} />
                            </div>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div>
                                <dt className="text-secondary pb-1 text-xs font-medium">Monto</dt>
                                <dd className="tabular-data font-medium">
                                  {formatServiceAmount(service)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-secondary pb-1 text-xs font-medium">
                                  Vencimiento
                                </dt>
                                <dd>
                                  <DueDate service={service} state={state} today={today} />
                                </dd>
                              </div>
                              {service.description && (
                                <div className="col-span-2">
                                  <dt className="text-secondary pb-1 text-xs font-medium">
                                    Descripción
                                  </dt>
                                  <dd
                                    className="break-words whitespace-pre-wrap"
                                    title={service.description}
                                  >
                                    {service.description}
                                  </dd>
                                </div>
                              )}
                            </dl>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => void handleTogglePayment(service)}
                              >
                                {state === 'paid' ? 'Marcar sin pagar' : 'Marcar pagado'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                onClick={() => void handleDeleteService(service)}
                              >
                                <Trash2 aria-hidden="true" />
                                Eliminar
                              </Button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEdit(group)}
                      >
                        Editar cliente
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openAddService(group)}
                      >
                        <Plus aria-hidden="true" />
                        Agregar servicio
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => void handleDelete(group)}
                      >
                        Eliminar Cliente
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Desktop: dense table, one row per client. */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Servicios</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="align-top">
                          <div className="min-w-0">
                            <p className="font-medium" title={group.name}>
                              <UserRound
                                className="text-muted-foreground me-1.5 inline size-3.5"
                                aria-hidden="true"
                              />
                              {group.name}
                            </p>
                            <p
                              className="text-secondary max-w-48 truncate text-xs"
                              title={group.email ?? undefined}
                            >
                              {group.email || 'Sin correo'}
                            </p>
                            <p className="text-secondary tabular-data mt-1 text-xs">
                              {group.services.length}{' '}
                              {group.services.length === 1 ? 'servicio' : 'servicios'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <ul className="min-w-72 space-y-2">
                            {group.services.map((service) => {
                              const state = getServiceState(service, today)
                              return (
                                <li
                                  key={service.id}
                                  className="border-border/70 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-3 py-2"
                                >
                                  <div className="min-w-28">
                                    <ServiceTypeTag type={service.serviceType} />
                                  </div>
                                  <div className="min-w-20">
                                    <p className="text-secondary text-xs">Monto</p>
                                    <p className="tabular-data text-sm font-medium">
                                      {formatServiceAmount(service)}
                                    </p>
                                  </div>
                                  <div className="min-w-24">
                                    <p className="text-secondary text-xs">Vencimiento</p>
                                    <p className="tabular-data text-sm font-medium">
                                      {service.dueDate
                                        ? format(parseISO(service.dueDate), 'dd/MM/yyyy')
                                        : '—'}
                                    </p>
                                  </div>
                                  <div className="min-w-24">
                                    <StateBadge state={state} />
                                    <p className="text-secondary mt-1 text-xs">
                                      {getServiceCountdown(service, today)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      onClick={() => void handleTogglePayment(service)}
                                    >
                                      {state === 'paid' ? 'Sin pagar' : 'Marcar pagado'}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="xs"
                                      aria-label={`Eliminar servicio ${service.serviceType} de ${service.clientName}`}
                                      onClick={() => void handleDeleteService(service)}
                                    >
                                      <Trash2 aria-hidden="true" />
                                      Eliminar
                                    </Button>
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        </TableCell>
                        <TableCell className="text-right align-top whitespace-nowrap">
                          <div className="space-y-2">
                            <div>
                              <Button
                                className="w-full"
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(group)}
                              >
                                Editar cliente
                              </Button>
                            </div>
                            <div>
                              <Button
                                className="w-full"
                                variant="outline"
                                size="sm"
                                onClick={() => openAddService(group)}
                              >
                                <Plus aria-hidden="true" />
                                Agregar servicio
                              </Button>
                            </div>
                            <div>
                              <Button
                                className="w-full"
                                variant="destructive"
                                size="sm"
                                onClick={() => void handleDelete(group)}
                              >
                                Eliminar cliente
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </section>
      </div>

      {dialog && (
        <ClientFormDialog
          key={`${dialog.anchor?.id ?? 'new'}-${dialog.addService ? 'add' : 'edit'}`}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null)
          }}
          service={dialog.anchor}
          additionalServices={dialog.clientServices.filter((item) => item.id !== dialog.anchor?.id)}
          startWithNewService={dialog.addService}
        />
      )}
    </main>
  )
}
