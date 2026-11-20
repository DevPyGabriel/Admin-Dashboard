import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  useCompanySettings,
  useSendReminders,
  useUpdateCompanySettings,
} from '@/features/settings/hooks/useSettings'
import {
  companySettingsSchema,
  type CompanySettingsValues,
} from '@/features/settings/schemas/settings.schema'

interface Notice {
  text: string
  tone: 'success' | 'danger'
}

export default function SettingsPage() {
  const [notice, setNotice] = useState<Notice | null>(null)
  const [testEmail, setTestEmail] = useState('')

  const settingsQuery = useCompanySettings()
  const updateSettings = useUpdateCompanySettings()
  const sendReminders = useSendReminders()

  const form = useForm<CompanySettingsValues>({
    resolver: zodResolver(companySettingsSchema),
    values: settingsQuery.data
      ? {
          bs_exchange_rate: settingsQuery.data.bs_exchange_rate ?? 0,
          company_name: settingsQuery.data.company_name,
          support_email: settingsQuery.data.support_email,
          sender_email: settingsQuery.data.sender_email ?? '',
          operator_emails: (settingsQuery.data.operator_emails ?? []).join(', '),
          currency: settingsQuery.data.currency,
          timezone: settingsQuery.data.timezone,
          reminder_days_before: settingsQuery.data.reminder_days_before,
        }
      : undefined,
  })

  const onSave = form.handleSubmit((values) => {
    setNotice(null)
    updateSettings.mutate(values, {
      onSuccess: () => setNotice({ text: 'Configuración guardada.', tone: 'success' }),
      onError: (error) =>
        setNotice({ text: `No se pudo guardar: ${error.message}`, tone: 'danger' }),
    })
  })

  const onSend = (email?: string) => {
    setNotice(null)
    sendReminders.mutate(email, {
      onSuccess: (result) => {
        if (result.error) {
          setNotice({ text: result.error, tone: 'danger' })
          return
        }
        if (result.test) {
          const details = (result.results ?? [])
            .map((delivery) => `${delivery.to}: ${delivery.ok ? 'enviado' : delivery.error}`)
            .join(' · ')
          setNotice({
            text: `Correo de prueba → ${details || 'sin destinatarios'}.`,
            tone: result.failed > 0 ? 'danger' : 'success',
          })
          return
        }
        setNotice({
          text: `Recordatorios: ${result.sent} enviados, ${result.skipped} ya registrados, ${result.failed} con error. Copias al operador: ${result.operatorSent ?? 0} enviadas${result.operatorFailed ? `, ${result.operatorFailed} fallidas` : ''}.`,
          tone: result.failed > 0 || (result.operatorFailed ?? 0) > 0 ? 'danger' : 'success',
        })
      },
      onError: (error) => setNotice({ text: error.message, tone: 'danger' }),
    })
  }

  const loadError = settingsQuery.error

  return (
    <main className="page-container py-6 sm:py-8">
      <div className="space-y-6">
        <PageHeader
          title="Configuración"
          description="Datos de la empresa y envío automático de recordatorios."
        />

        {notice && (
          <p
            role="status"
            className={notice.tone === 'danger' ? 'text-danger text-sm' : 'text-success text-sm'}
          >
            {notice.text}
          </p>
        )}
        {loadError && (
          <p className="text-danger text-sm" role="alert">
            No se pudo cargar la configuración: {loadError.message}
          </p>
        )}

        <section className="surface-panel p-4" aria-label="Datos de la empresa">
          <h2 className="text-base font-medium">Datos de la empresa</h2>
          <p className="text-secondary mt-1 text-sm">
            El correo de empresa se usa como remitente de los recordatorios. Debe ser un dominio
            verificado en Resend.
          </p>

          <form onSubmit={onSave} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
            <div className="space-y-2">
              <Label htmlFor="company_name">Nombre de la empresa</Label>
              <Input
                id="company_name"
                autoComplete="organization"
                aria-invalid={!!form.formState.errors.company_name}
                {...form.register('company_name')}
              />
              {form.formState.errors.company_name && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.company_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="support_email">Correo de soporte</Label>
              <Input
                id="support_email"
                type="email"
                autoComplete="email"
                aria-invalid={!!form.formState.errors.support_email}
                {...form.register('support_email')}
              />
              {form.formState.errors.support_email && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.support_email.message}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="operator_emails">Correos de operadores (copia)</Label>
              <Input
                id="operator_emails"
                type="text"
                placeholder="operador@ejemplo.com, otro@ejemplo.com"
                aria-describedby="operator_emails_help"
                aria-invalid={!!form.formState.errors.operator_emails}
                {...form.register('operator_emails')}
              />
              <p id="operator_emails_help" className="text-secondary text-xs">
                El correo de soporte también recibe una copia de cada recordatorio. Separa varios
                correos con comas.
              </p>
              {form.formState.errors.operator_emails && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.operator_emails.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender_email">Correo de la empresa (remitente)</Label>
              <Input
                id="sender_email"
                type="email"
                placeholder="onboarding@resend.dev"
                aria-invalid={!!form.formState.errors.sender_email}
                {...form.register('sender_email')}
              />
              {form.formState.errors.sender_email && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.sender_email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Input
                id="currency"
                maxLength={10}
                aria-invalid={!!form.formState.errors.currency}
                {...form.register('currency')}
              />
              {form.formState.errors.currency && (
                <p className="text-destructive text-xs">{form.formState.errors.currency.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bs_exchange_rate">Valor del Bs. (por 1 USD)</Label>
              <Input
                id="bs_exchange_rate"
                type="number"
                min={0}
                step="0.01"
                aria-describedby="bs_exchange_rate_help"
                aria-invalid={!!form.formState.errors.bs_exchange_rate}
                {...form.register('bs_exchange_rate', { valueAsNumber: true })}
              />
              <p id="bs_exchange_rate_help" className="text-secondary text-xs">
                Se usa para mostrar el equivalente en bolívares en los mensajes de WhatsApp.
              </p>
              {form.formState.errors.bs_exchange_rate && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.bs_exchange_rate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Input
                id="timezone"
                aria-invalid={!!form.formState.errors.timezone}
                {...form.register('timezone')}
              />
              {form.formState.errors.timezone && (
                <p className="text-destructive text-xs">{form.formState.errors.timezone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_days_before">Avisar días antes del vencimiento</Label>
              <Input
                id="reminder_days_before"
                type="number"
                min={1}
                max={30}
                aria-invalid={!!form.formState.errors.reminder_days_before}
                {...form.register('reminder_days_before', { valueAsNumber: true })}
              />
              {form.formState.errors.reminder_days_before && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.reminder_days_before.message}
                </p>
              )}
            </div>

            <div className="flex sm:col-span-2">
              <Button type="submit" size="sm" disabled={updateSettings.isPending}>
                {updateSettings.isPending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </section>

        <section className="surface-panel p-4" aria-label="Recordatorios automáticos">
          <h2 className="text-base font-medium">Recordatorios automáticos</h2>
          <p className="text-secondary mt-1 text-sm">
            El envío diario se ejecuta a las 09:00 UTC para servicios pendientes y por cobrar. Los
            pagos ya registrados y los avisos enviados para el mismo ciclo se omiten.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full space-y-2 sm:max-w-xs">
              <Label htmlFor="test_email">Correo de prueba</Label>
              <Input
                id="test_email"
                type="email"
                placeholder="tu-correo@ejemplo.com"
                value={testEmail}
                onChange={(event) => setTestEmail(event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={sendReminders.isPending || !testEmail.trim()}
              onClick={() => onSend(testEmail.trim())}
            >
              Enviar correo de prueba
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={sendReminders.isPending}
              onClick={() => onSend()}
            >
              Enviar todos ahora
            </Button>
          </div>

          {sendReminders.data && (
            <p className="text-secondary mt-3 text-xs">
              Último envío: {sendReminders.data.scanned} servicios revisados ·{' '}
              {sendReminders.data.sent} enviados · {sendReminders.data.skipped} omitidos ·{' '}
              {sendReminders.data.failed} fallidos · Copias al operador:{' '}
              {sendReminders.data.operatorSent ?? 0} enviadas
              {sendReminders.data.operatorRecipients?.length
                ? ` (${sendReminders.data.operatorRecipients.join(', ')})`
                : ''}
              {sendReminders.data.from && ` · Remitente: ${sendReminders.data.from}`}
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
