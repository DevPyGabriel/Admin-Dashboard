import { supabase } from '@/lib/supabase/client'
import type {
  ClientFormValues,
  ClientServiceValues,
} from '@/features/clients/schemas/client.schema'
import type { Database } from '@/types/database.types'

type PaymentStatus = Database['public']['Tables']['payments']['Row']['status']
type SaveClientArgs = Database['public']['Functions']['save_client_with_services']['Args']

/** A service row as it is stored in the subscriptions table. */
export interface ClientService {
  id: string
  clientId: string
  clientName: string
  email: string | null
  serviceType: string
  dueDate: string | null
  amount: number
  currency: string
  description: string | null
  createdAt: string
  payments: Array<{
    id: string
    status: PaymentStatus
    billing_date: string | null
  }>
}

function toServicePayload(service: ClientServiceValues) {
  return {
    id: service.id ?? '',
    service_type: service.service_type,
    amount: service.amount,
    due_date: service.due_date,
    description: service.description,
  }
}

function fromClientService(service: ClientService): ClientServiceValues {
  return {
    id: service.id,
    service_type: service.serviceType as ClientServiceValues['service_type'],
    amount: service.amount,
    due_date: service.dueDate ?? '',
    description: service.description ?? '',
  }
}

/** Creates or updates the client and all of its services in one transaction. */
export async function saveClientWithServices(values: ClientFormValues): Promise<string> {
  const args = {
    p_client_id: null,
    p_full_name: values.full_name,
    p_email: values.email || null,
    p_services: values.services.map(toServicePayload),
  } as unknown as SaveClientArgs

  const { data, error } = await supabase.rpc('save_client_with_services', args)

  if (error) throw new Error(error.message)
  return data
}

/** Adds one service to an existing client without touching its other services. */
export async function createClientService(
  clientId: string,
  service: ClientServiceValues,
): Promise<void> {
  const client = await fetchClient(clientId)
  await saveClientWithServices({
    full_name: client.full_name,
    email: client.email ?? '',
    services: [
      ...(await listClientServicesFor(clientId)).map(fromClientService),
      toServicePayload(service),
    ],
  })
}

/** Deletes one service while preserving the rest of the client's services. */
export async function deleteClientService(service: ClientService): Promise<void> {
  const remaining = (await listClientServicesFor(service.clientId)).filter(
    (item) => item.id !== service.id,
  )

  if (remaining.length === 0) {
    throw new Error(
      'El cliente debe mantener al menos un servicio. Usa «Eliminar cliente» si ya no lo necesitas.',
    )
  }

  const client = await fetchClient(service.clientId)
  await saveClientWithServices({
    full_name: client.full_name,
    email: client.email ?? '',
    services: remaining.map(fromClientService),
  })
}

/** Updates one service without touching the rest of the client's services. */
export async function updateClientService(service: ClientService): Promise<void> {
  const client = await fetchClient(service.clientId)
  const services = (await listClientServicesFor(service.clientId)).map((current) =>
    current.id === service.id
      ? {
          id: current.id,
          service_type: service.serviceType as ClientServiceValues['service_type'],
          amount: service.amount,
          due_date: service.dueDate ?? '',
          description: service.description ?? '',
        }
      : fromClientService(current),
  )

  await saveClientWithServices({
    full_name: client.full_name,
    email: client.email ?? '',
    services,
  })
}

async function fetchClient(clientId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('full_name, email')
    .eq('id', clientId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('No se encontró el cliente')
  return data
}

/** Reads all client-service rows through the existing view-safe query. */
export async function listClientServices(): Promise<ClientService[]> {
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, full_name, email, created_at')
    .order('created_at', { ascending: false })
  if (clientsError) throw new Error(clientsError.message)

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .select(
      'id, client_id, plan_name, amount, currency, next_billing_date, description, created_at',
    )
    .order('created_at', { ascending: false })
  if (subscriptionsError) throw new Error(subscriptionsError.message)

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('id, subscription_id, status, billing_date')
  if (paymentsError) throw new Error(paymentsError.message)

  const clientsById = new Map((clients ?? []).map((client) => [client.id, client]))

  return (subscriptions ?? [])
    .filter((subscription) => clientsById.has(subscription.client_id))
    .map((subscription) => {
      const client = clientsById.get(subscription.client_id)!
      return {
        id: subscription.id,
        clientId: client.id,
        clientName: client.full_name,
        email: client.email,
        serviceType: subscription.plan_name,
        dueDate: subscription.next_billing_date,
        amount: Number(subscription.amount),
        currency: subscription.currency,
        description: subscription.description,
        createdAt: subscription.created_at,
        payments: (payments ?? [])
          .filter((payment) => payment.subscription_id === subscription.id)
          .map((payment) => ({
            id: payment.id,
            status: payment.status,
            billing_date: payment.billing_date,
          })),
      }
    })
}

export async function listClientServicesFor(clientId: string): Promise<ClientService[]> {
  const services = await listClientServices()
  return services.filter((service) => service.clientId === clientId)
}

export async function deleteClient(clientId: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', clientId)
  if (error) throw new Error(error.message)
}

export async function registerPayment(service: ClientService): Promise<void> {
  const { error } = await supabase.from('payments').insert({
    subscription_id: service.id,
    amount: service.amount,
    status: 'paid',
    billing_date: service.dueDate,
  })
  if (error) throw new Error(error.message)
}

export async function unregisterPayment(service: ClientService): Promise<void> {
  const payment = service.payments.find((item) => item.billing_date === service.dueDate)
  if (!payment) return
  const { error } = await supabase.from('payments').delete().eq('id', payment.id)
  if (error) throw new Error(error.message)
}
