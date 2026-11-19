import { supabase } from '@/lib/supabase/client'
import {
  parseOperatorEmails,
  type CompanySettingsValues,
} from '@/features/settings/schemas/settings.schema'
import type { Database } from '@/types/database.types'

export type CompanySettings = Database['public']['Tables']['company_settings']['Row']

export async function getCompanySettings(): Promise<CompanySettings> {
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .eq('id', true)
    .single()

  if (error) throw error
  return data
}

export async function updateCompanySettings(
  values: CompanySettingsValues,
): Promise<CompanySettings> {
  const { data, error } = await supabase
    .from('company_settings')
    .update({
      id: true,
      company_name: values.company_name,
      support_email: values.support_email,
      sender_email: values.sender_email || null,
      operator_emails: parseOperatorEmails(values.operator_emails),
      currency: values.currency,
      timezone: values.timezone,
      reminder_days_before: values.reminder_days_before,
    })
    .eq('id', true)
    .select()
    .single()

  if (error) throw error
  return data
}
