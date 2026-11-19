import { supabase } from '@/lib/supabase/client'
import type { ClientFormValues } from '@/features/clients/schemas/client.schema'
import type { Database } from '@/types/database.types'

type PaymentStatus = Database['public']['Tables']['payments']['Row']['status']

/** A client paired with the service row that drives its dashboard state. */
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

async function fetchService(clientId: string): Promise<ClientService> {
  const services = await listClientServices()
  const service = services.find((item) => item.clientId === clientId)
  if (!service) throw new Error('No se pudo cargar el servicio guardado')
  return service
}

function toClientValues(values: ClientFormValues) {
  return {
    full_name: values.full_name,
    email: values.email || null,
  }
}

function toServiceValues(values: ClientFormValues) {
  return {
    plan_name: values.service_type,
    amount: values.amount,
    next_billing_date: values.due_date || null,
    description: values.description || null,
  }
}

export async function listClientServices(): Promise<ClientService[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      'id, client_id, plan_name, amount, currency, description, next_billing_date, created_at, clients!inner(full_name, email), payments(id, status, billing_date)',
    )
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    clientId: row.client_id,
    clientName: row.clients.full_name,
    email: row.clients.email,
    serviceType: row.plan_name,
    dueDate: row.next_billing_date,
    amount: row.amount,
    currency: row.currency,
    description: row.description,
    createdAt: row.created_at,
    payments: row.payments.map((payment) => ({
      id: payment.id,
      status: payment.status,
      billing_date: payment.billing_date,
    })),
  }))
}

export async function createClientService(values: ClientFormValues): Promise<ClientService> {
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert(toClientValues(values))
    .select('id')
    .single()

  if (clientError) throw clientError

  const { error: serviceError } = await supabase
    .from('subscriptions')
    .insert({ client_id: client.id, ...toServiceValues(values) })

  if (serviceError) {
    // Avoid leaving a contact without its service when the second write fails.
    await supabase.from('clients').delete().eq('id', client.id)
    throw serviceError
  }

  return fetchService(client.id)
}

export async function updateClientService(
  clientId: string,
  subscriptionId: string,
  values: ClientFormValues,
): Promise<ClientService> {
  const { error: clientError } = await supabase
    .from('clients')
    .update(toClientValues(values))
    .eq('id', clientId)

  if (clientError) throw clientError

  const { error: serviceError } = await supabase
    .from('subscriptions')
    .update(toServiceValues(values))
    .eq('id', subscriptionId)

  if (serviceError) throw serviceError

  return fetchService(clientId)
}

export async function deleteClient(clientId: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', clientId)
  if (error) throw error
}

export async function registerPayment(service: ClientService): Promise<void> {
  const { error } = await supabase.from('payments').insert({
    subscription_id: service.id,
    amount: service.amount,
    billing_date: service.dueDate,
    status: 'paid',
  })

  if (error) throw error
}

export async function unregisterPayment(paymentId: string): Promise<void> {
  const { error } = await supabase.from('payments').delete().eq('id', paymentId)
  if (error) throw error
}
