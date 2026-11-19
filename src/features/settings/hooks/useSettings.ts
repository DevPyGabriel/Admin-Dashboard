import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCompanySettings, updateCompanySettings } from '@/features/settings/api/settings.api'
import { invokeEdgeFunction } from '@/lib/supabase/functions'

export const companySettingsQueryKey = ['company-settings'] as const

export function useCompanySettings() {
  return useQuery({
    queryKey: companySettingsQueryKey,
    queryFn: getCompanySettings,
  })
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCompanySettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companySettingsQueryKey })
    },
  })
}

export interface DeliveryResult {
  to: string
  ok: boolean
  error: string | null
}

export interface ReminderResult {
  scanned: number
  sent: number
  failed: number
  skipped: number
  test?: boolean
  recipient?: string
  service?: string
  from?: string
  message?: string
  error?: string | null
  results?: DeliveryResult[]
  operatorSent?: number
  operatorFailed?: number
  operatorRecipients?: string[]
}

export function useSendReminders() {
  return useMutation({
    mutationFn: (testEmail?: string) =>
      invokeEdgeFunction<ReminderResult, { testEmail?: string }>(
        'process-subscription-reminders',
        testEmail ? { testEmail } : {},
      ),
  })
}
