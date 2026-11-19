import { supabase } from '@/lib/supabase/client'
import type { ClientFormValues } from '@/features/clients/schemas/client.schema'
import type { Database } from '@/types/database.types'

type ClientsTable = Database['public']['Tables']['clients']
export type Client = ClientsTable['Row']
type ClientInsert = ClientsTable['Insert']
type ClientUpdate = ClientsTable['Update']

function toPayload(values: ClientFormValues) {
  return {
    full_name: values.full_name,
    email: values.email,
    phone: values.phone || null,
    tax_id: values.tax_id || null,
    notes: values.notes || null,
  }
}

export async function listClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createClient(values: ClientFormValues): Promise<Client> {
  const payload: ClientInsert = toPayload(values)
  const { data, error } = await supabase.from('clients').insert(payload).select('*').single()

  if (error) throw error
  return data
}

export async function updateClient(id: string, values: ClientFormValues): Promise<Client> {
  const payload: ClientUpdate = toPayload(values)
  const { data, error } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}
