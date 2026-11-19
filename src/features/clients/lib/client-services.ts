import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'
import type { ClientService } from '@/features/clients/api/clients.api'

export type ServicePaymentState = 'paid' | 'pending' | 'overdue'
export type ServiceFilter = 'all' | 'recent' | 'paid' | 'unpaid' | 'pending' | 'overdue'
export type ServiceSort = 'urgency' | 'due' | 'recent' | 'amount'

export const serviceFilterLabels: Record<ServiceFilter, string> = {
  all: 'Todos',
  recent: 'Recientes',
  paid: 'Pagados',
  unpaid: 'Sin pagar',
  pending: 'Pendientes',
  overdue: 'Por cobrar',
}

export const serviceSortLabels: Record<ServiceSort, string> = {
  urgency: 'Prioridad',
  due: 'Vencimiento',
  recent: 'Recientes',
  amount: 'Monto',
}

export const serviceStateLabels: Record<ServicePaymentState, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  overdue: 'Por cobrar',
}

const statePriority: Record<ServicePaymentState, number> = {
  overdue: 0,
  pending: 1,
  paid: 2,
}

function plural(count: number, singular: string, pluralForm: string) {
  return count === 1 ? singular : pluralForm
}

export function getServiceState(service: ClientService, today = new Date()): ServicePaymentState {
  const paid = service.payments.some((payment) => {
    if (payment.status !== 'paid') return false
    if (!service.dueDate) return true
    return !payment.billing_date || payment.billing_date === service.dueDate
  })

  if (paid) return 'paid'
  if (!service.dueDate) return 'pending'

  const daysUntilDue = differenceInCalendarDays(parseISO(service.dueDate), startOfDay(today))
  return daysUntilDue <= 0 ? 'overdue' : 'pending'
}

export function getServiceCountdown(service: ClientService, today = new Date()): string {
  if (getServiceState(service, today) === 'paid') return 'Sin cobro pendiente'
  if (!service.dueDate) return 'Sin fecha de corte'

  const days = differenceInCalendarDays(parseISO(service.dueDate), startOfDay(today))
  if (days === 0) return 'Fecha de corte hoy'
  if (days < 0) {
    const amount = Math.abs(days)
    return `Vencido hace ${amount} ${plural(amount, 'día', 'días')}`
  }
  return `Vence en ${days} ${plural(days, 'día', 'días')}`
}

export function formatServiceAmount(service: ClientService): string {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: service.currency || 'USD',
    }).format(service.amount)
  } catch {
    return `${service.amount.toFixed(2)} ${service.currency || 'USD'}`
  }
}

export interface ServiceViewOptions {
  query: string
  date: string
  filter: ServiceFilter
  sort: ServiceSort
}

export function selectServices(
  services: ClientService[],
  { query, date, filter, sort }: ServiceViewOptions,
  today = new Date(),
): ClientService[] {
  const search = query.trim().toLocaleLowerCase('es')

  const filtered = services.filter((service) => {
    const state = getServiceState(service, today)

    if (filter === 'paid' && state !== 'paid') return false
    if (filter === 'unpaid' && state === 'paid') return false
    if (filter === 'pending' && state !== 'pending') return false
    if (filter === 'overdue' && state !== 'overdue') return false
    if (filter === 'recent') {
      const cutoff = new Date(today)
      cutoff.setDate(cutoff.getDate() - 7)
      if (new Date(service.createdAt) < cutoff) return false
    }
    if (date && service.dueDate !== date) return false

    if (!search) return true
    return [
      service.clientName,
      service.serviceType,
      service.email ?? '',
      service.description ?? '',
      serviceStateLabels[state],
    ].some((value) => value.toLocaleLowerCase('es').includes(search))
  })

  const dueTime = (service: ClientService) =>
    service.dueDate ? parseISO(service.dueDate).getTime() : Number.MAX_SAFE_INTEGER
  const createdTime = (service: ClientService) => new Date(service.createdAt).getTime()

  return [...filtered].sort((a, b) => {
    if (sort === 'due') return dueTime(a) - dueTime(b) || createdTime(b) - createdTime(a)
    if (sort === 'recent') return createdTime(b) - createdTime(a)
    if (sort === 'amount') return b.amount - a.amount || createdTime(b) - createdTime(a)

    const byState =
      statePriority[getServiceState(a, today)] - statePriority[getServiceState(b, today)]
    return byState || dueTime(a) - dueTime(b) || createdTime(b) - createdTime(a)
  })
}
