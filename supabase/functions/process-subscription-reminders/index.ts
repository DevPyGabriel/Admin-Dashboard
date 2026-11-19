import { createClient } from 'jsr:@supabase/supabase-js@2'

type ReminderKind = 'upcoming_charge' | 'payment_due'

interface ReminderTarget {
  id: string
  clientName: string
  email: string
  serviceType: string
  amount: number
  currency: string
  dueDate: string
  kind: ReminderKind
  daysUntilDue: number
}

interface SubscriptionRow {
  id: string
  plan_name: string
  amount: number
  currency: string
  next_billing_date: string | null
  auto_remind: boolean
  clients: { full_name: string; email: string | null }
  payments: Array<{ status: string; billing_date: string | null }>
}

interface SettingsRow {
  company_name: string
  support_email: string
  sender_email: string | null
  currency: string
  reminder_days_before: number
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const serviceLabels: Record<string, string> = {
  transporte: 'Transporte',
  taxi: 'Taxi',
  delivery: 'Delivery',
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char,
  )
}

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency || 'USD'}`
  }
}

async function authorize(
  req: Request,
  body: { testEmail?: unknown },
): Promise<{ testEmail: string | null } | Response> {
  const testEmail = typeof body.testEmail === 'string' ? body.testEmail.trim() || null : null
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret && req.headers.get('x-cron-secret') === cronSecret) {
    return { testEmail }
  }

  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return json(401, { error: 'Se requiere autenticación' })

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )

  const { data, error } = await userClient.auth.getUser(token)
  if (error || !data.user) return json(401, { error: 'Sesión inválida' })

  const { data: operator } = await userClient
    .from('operators')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (!operator) return json(403, { error: 'El usuario no es operador' })

  return { testEmail }
}

function buildTargets(
  rows: SubscriptionRow[],
  settings: SettingsRow,
  includeDisabled: boolean,
): ReminderTarget[] {
  const today = new Date().toISOString().slice(0, 10)
  const todayMs = Date.parse(`${today}T00:00:00Z`)
  const targets: ReminderTarget[] = []

  for (const row of rows) {
    if (!row.auto_remind && !includeDisabled) continue

    const email = row.clients?.email
    const dueDate = row.next_billing_date
    if (!email || !dueDate) continue

    const paid = (row.payments ?? []).some(
      (payment) =>
        payment.status === 'paid' && (!payment.billing_date || payment.billing_date === dueDate),
    )
    if (paid) continue

    const daysUntilDue = Math.round((Date.parse(`${dueDate}T00:00:00Z`) - todayMs) / 86_400_000)
    if (daysUntilDue > settings.reminder_days_before) continue

    targets.push({
      id: row.id,
      clientName: row.clients.full_name,
      email,
      serviceType: row.plan_name,
      amount: Number(row.amount),
      currency: row.currency,
      dueDate,
      kind: daysUntilDue <= 0 ? 'payment_due' : 'upcoming_charge',
      daysUntilDue,
    })
  }

  return targets.sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}

function buildEmail(target: ReminderTarget, settings: SettingsRow) {
  const service = serviceLabels[target.serviceType] ?? target.serviceType
  const amount = formatAmount(target.amount, target.currency)
  const company = escapeHtml(settings.company_name || 'NovaDrive')
  const client = escapeHtml(target.clientName)
  const subject =
    target.kind === 'payment_due'
      ? `Recordatorio de pago: ${service} vencido`
      : `Recordatorio: ${service} vence en ${target.daysUntilDue} ${target.daysUntilDue === 1 ? 'día' : 'días'}`

  const detail =
    target.kind === 'payment_due'
      ? `Su servicio de ${escapeHtml(service)} venció el ${escapeHtml(target.dueDate)} y aún no registramos el pago.`
      : `Su servicio de ${escapeHtml(service)} vence el ${escapeHtml(target.dueDate)}.`

  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#18181b">
  <p>Hola ${client},</p>
  <p>${detail}</p>
  <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin:16px 0">
    <tr><td><strong>Servicio</strong></td><td>${escapeHtml(service)}</td></tr>
    <tr><td><strong>Monto</strong></td><td>${escapeHtml(amount)}</td></tr>
    <tr><td><strong>Vencimiento</strong></td><td>${escapeHtml(target.dueDate)}</td></tr>
  </table>
  <p>Si ya realizaste el pago, ignora este mensaje. Consultas: ${escapeHtml(settings.support_email)}.</p>
  <p>Saludos,<br />${company}</p>
</div>`

  const text = `Hola ${target.clientName},\n\n${detail}\n\nServicio: ${service}\nMonto: ${amount}\nVencimiento: ${target.dueDate}\n\nSi ya realizaste el pago, ignora este mensaje. Consultas: ${settings.support_email}.\n\nSaludos,\n${settings.company_name || 'NovaDrive'}`

  return { subject, html, text }
}

async function sendViaResend(
  from: string,
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<{ ok: true; id: string | null } | { ok: false; error: string }> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY') ?? ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  })
  const payload = (await response.json().catch(() => null)) as {
    id?: string
    message?: string
  } | null

  if (!response.ok) {
    return { ok: false, error: payload?.message ?? `Resend respondió HTTP ${response.status}` }
  }
  return { ok: true, id: payload?.id ?? null }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json(405, { error: 'Método no permitido' })

  const body = (await req.json().catch(() => ({}))) as { testEmail?: unknown }
  const auth = await authorize(req, body)
  if (auth instanceof Response) return auth

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!supabaseUrl || !serviceKey) {
    return json(500, { error: 'Faltan variables de entorno de Supabase' })
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: settings, error: settingsError } = await admin
    .from('company_settings')
    .select('company_name, support_email, sender_email, currency, reminder_days_before')
    .eq('id', true)
    .maybeSingle()

  if (settingsError || !settings) {
    return json(500, { error: 'No se pudo cargar la configuración de la empresa' })
  }

  const config = settings as SettingsRow
  if (!Deno.env.get('RESEND_API_KEY')) {
    return json(500, { error: 'RESEND_API_KEY no está configurada en los secretos de Supabase' })
  }

  const fromAddress = config.sender_email?.trim() || 'onboarding@resend.dev'
  const from = `${config.company_name || 'NovaDrive'} <${fromAddress}>`

  const { data: rows, error: rowsError } = await admin
    .from('subscriptions')
    .select(
      'id, plan_name, amount, currency, next_billing_date, auto_remind, clients!inner(full_name, email), payments(status, billing_date)',
    )
    .eq('status', 'active')

  if (rowsError) return json(500, { error: 'No se pudieron cargar los servicios' })

  const targets = buildTargets(
    (rows ?? []) as unknown as SubscriptionRow[],
    config,
    Boolean(auth.testEmail),
  )

  if (auth.testEmail) {
    const target = targets[0]
    if (!target) {
      return json(200, {
        scanned: 0,
        sent: 0,
        failed: 0,
        skipped: 0,
        message: 'No hay servicios pendientes ni por cobrar para enviar',
      })
    }
    const email = buildEmail(target, config)
    const result = await sendViaResend(from, auth.testEmail, email.subject, email.html, email.text)
    return json(result.ok ? 200 : 502, {
      scanned: targets.length,
      sent: result.ok ? 1 : 0,
      failed: result.ok ? 0 : 1,
      skipped: 0,
      test: true,
      recipient: auth.testEmail,
      service: target.serviceType,
      error: result.ok ? null : result.error,
    })
  }

  let sent = 0
  let failed = 0
  let skipped = 0

  for (const target of targets) {
    const { data: previous } = await admin
      .from('reminder_logs')
      .select('status')
      .eq('subscription_id', target.id)
      .eq('reminder_type', target.kind)
      .eq('billing_date', target.dueDate)
      .maybeSingle()

    if (previous && previous.status !== 'failed') {
      skipped += 1
      continue
    }

    const email = buildEmail(target, config)
    const result = await sendViaResend(from, target.email, email.subject, email.html, email.text)

    const { error: logError } = await admin.from('reminder_logs').upsert({
      subscription_id: target.id,
      reminder_type: target.kind,
      billing_date: target.dueDate,
      status: result.ok ? 'sent' : 'failed',
      provider_id: result.ok ? result.id : null,
      error: result.ok ? null : result.error,
    })

    if (result.ok) sent += 1
    else failed += 1

    if (logError) {
      console.error('No se pudo registrar el recordatorio:', logError.message)
    }
  }

  return json(200, {
    scanned: targets.length,
    sent,
    failed,
    skipped,
    from: fromAddress,
  })
})
