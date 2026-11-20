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

interface ReminderGroup {
  email: string
  clientName: string
  targets: ReminderTarget[]
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
  operator_emails: string[] | null
  currency: string
  reminder_days_before: number
}

interface LogRow {
  status: string
  sent_at: string
}

interface DeliveryResult {
  to: string
  ok: boolean
  error: string | null
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

const overdueRepeatMs = 3 * 86_400_000

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

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function getOperatorRecipients(settings: SettingsRow, exclude?: string | string[]): string[] {
  const excluded = new Set(
    (Array.isArray(exclude) ? exclude : exclude ? [exclude] : [])
      .map(normalizeEmail)
      .filter(Boolean),
  )
  return Array.from(
    new Set(
      [settings.support_email, ...(settings.operator_emails ?? [])]
        .map(normalizeEmail)
        .filter((email) => email && !excluded.has(email)),
    ),
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

/** One email per client address, containing every service that is due soon or overdue. */
function groupTargets(targets: ReminderTarget[]): ReminderGroup[] {
  const groups = new Map<string, ReminderGroup>()

  for (const target of targets) {
    const key = normalizeEmail(target.email)
    const group = groups.get(key)
    if (group) {
      group.targets.push(target)
      continue
    }
    groups.set(key, {
      email: target.email,
      clientName: target.clientName,
      targets: [target],
    })
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      targets: [...group.targets].sort((a, b) => a.daysUntilDue - b.daysUntilDue),
    }))
    .sort((a, b) => a.targets[0].daysUntilDue - b.targets[0].daysUntilDue)
}

function buildEmail(targets: ReminderTarget[], settings: SettingsRow, operatorCopy = false) {
  const overdueCount = targets.filter((target) => target.kind === 'payment_due').length
  const count = targets.length
  const noun = count === 1 ? 'servicio' : 'servicios'
  const baseSubject = overdueCount
    ? `Recordatorio de pago: ${count} ${noun}`
    : `Recordatorio: ${count} ${noun} por vencer`
  const subject = operatorCopy ? `Copia operador: ${baseSubject}` : baseSubject

  const detail = overdueCount
    ? 'Incluimos los servicios que vencen en los próximos días y los que ya están vencidos y siguen sin pago. Los vencidos se recordarán cada 3 días hasta registrar el pago.'
    : 'Incluimos los servicios que vencen en los próximos días y siguen sin pago.'

  const greeting = operatorCopy
    ? `<p>Recordatorio enviado a <strong>${escapeHtml(targets[0].email)}</strong>:</p>`
    : `<p>Hola ${escapeHtml(targets[0].clientName)},</p>`

  const rowsHtml = targets
    .map((target) => {
      const service = serviceLabels[target.serviceType] ?? target.serviceType
      const amount = formatAmount(target.amount, target.currency)
      const status =
        target.kind === 'payment_due'
          ? `Vencido el ${target.dueDate}`
          : `Vence en ${target.daysUntilDue} ${target.daysUntilDue === 1 ? 'día' : 'días'}`
      return `<tr>
    <td>${escapeHtml(service)}</td>
    <td>${escapeHtml(amount)}</td>
    <td>${escapeHtml(target.dueDate)}</td>
    <td>${escapeHtml(status)}</td>
  </tr>`
    })
    .join('\n  ')

  const company = escapeHtml(settings.company_name || 'NovaDrive')
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#18181b">
  ${greeting}
  <p>${detail}</p>
  <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin:16px 0">
    <tr><th align="left">Servicio</th><th align="left">Monto</th><th align="left">Vencimiento</th><th align="left">Estado</th></tr>
    ${rowsHtml}
  </table>
  <p>Si ya realizaste el pago, ignora este mensaje. Consultas: ${escapeHtml(settings.support_email)}.</p>
  <p>Saludos,<br />${company}</p>
</div>`

  const textGreeting = operatorCopy
    ? `Recordatorio enviado a ${targets[0].email}:\n\n`
    : `Hola ${targets[0].clientName},\n\n`
  const lines = targets.map((target) => {
    const service = serviceLabels[target.serviceType] ?? target.serviceType
    const amount = formatAmount(target.amount, target.currency)
    const status =
      target.kind === 'payment_due'
        ? `Vencido el ${target.dueDate}`
        : `Vence en ${target.daysUntilDue} ${target.daysUntilDue === 1 ? 'día' : 'días'}`
    return `- ${service}: ${amount} | Vencimiento: ${target.dueDate} | ${status}`
  })
  const text = `${textGreeting}${detail}\n\n${lines.join('\n')}\n\nSi ya realizaste el pago, ignora este mensaje. Consultas: ${settings.support_email}.\n\nSaludos,\n${settings.company_name || 'NovaDrive'}`

  return { subject, html, text }
}

/** One consolidated operator email with every client, their services and the grand subtotal. */
function buildOperatorSummary(groups: ReminderGroup[], settings: SettingsRow) {
  const clients = groups.filter((group) => group.targets.length > 0)
  const targets = clients.flatMap((group) => group.targets)
  if (targets.length === 0) return null

  const serviceNoun = targets.length === 1 ? 'servicio' : 'servicios'
  const clientNoun = clients.length === 1 ? 'cliente' : 'clientes'
  const subject = `Copia operador: ${targets.length} ${serviceNoun} de ${clients.length} ${clientNoun}`

  const subtotals = new Map<string, number>()
  for (const target of targets) {
    const currency = target.currency || settings.currency || 'USD'
    subtotals.set(currency, (subtotals.get(currency) ?? 0) + target.amount)
  }
  const subtotalLabel =
    targets.length > 1
      ? Array.from(subtotals.entries())
          .map(([currency, amount]) => escapeHtml(formatAmount(amount, currency)))
          .join(' · ')
      : ''
  const subtotalHtml = subtotalLabel
    ? `<p><strong>Subtotal de todos los servicios:</strong> ${subtotalLabel}</p>`
    : ''

  const clientSectionsHtml = clients
    .map((group) => {
      const rows = group.targets
        .map((target) => {
          const service = serviceLabels[target.serviceType] ?? target.serviceType
          const amount = formatAmount(target.amount, target.currency)
          const status =
            target.kind === 'payment_due'
              ? `Vencido el ${target.dueDate}`
              : `Vence en ${target.daysUntilDue} ${target.daysUntilDue === 1 ? 'día' : 'días'}`
          return `<tr>
      <td>${escapeHtml(service)}</td>
      <td>${escapeHtml(amount)}</td>
      <td>${escapeHtml(target.dueDate)}</td>
      <td>${escapeHtml(status)}</td>
    </tr>`
        })
        .join('\n      ')
      return `<h3 style="margin-bottom:4px">${escapeHtml(group.clientName)} <span style="font-weight:normal;color:#71717a">(${escapeHtml(group.email)})</span></h3>
  <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin:8px 0 16px">
    <tr><th align="left">Servicio</th><th align="left">Monto</th><th align="left">Vencimiento</th><th align="left">Estado</th></tr>
      ${rows}
  </table>`
    })
    .join('\n  ')

  const company = escapeHtml(settings.company_name || 'NovaDrive')
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#18181b">
  <p>Resumen de los recordatorios de pago enviados:</p>
  ${clientSectionsHtml}
  ${subtotalHtml}
  <p>Saludos,<br />${company}</p>
</div>`

  const clientSectionsText = clients
    .map((group) => {
      const lines = group.targets.map((target) => {
        const service = serviceLabels[target.serviceType] ?? target.serviceType
        const amount = formatAmount(target.amount, target.currency)
        const status =
          target.kind === 'payment_due'
            ? `Vencido el ${target.dueDate}`
            : `Vence en ${target.daysUntilDue} ${target.daysUntilDue === 1 ? 'día' : 'días'}`
        return `- ${service}: ${amount} | Vencimiento: ${target.dueDate} | ${status}`
      })
      return `${group.clientName} (${group.email})\n${lines.join('\n')}`
    })
    .join('\n\n')
  const subtotalText = subtotalLabel ? `Subtotal de todos los servicios: ${subtotalLabel}\n\n` : ''
  const text = `Resumen de los recordatorios de pago enviados:\n\n${clientSectionsText}\n\n${subtotalText}Saludos,\n${settings.company_name || 'NovaDrive'}`

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

function shouldSend(target: ReminderTarget, previous: LogRow | null, nowMs: number): boolean {
  if (!previous) return true
  if (previous.status !== 'sent') return true
  if (target.kind !== 'payment_due') return false

  const sentAt = Date.parse(previous.sent_at)
  return Number.isNaN(sentAt) || nowMs - sentAt >= overdueRepeatMs
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
    .select(
      'company_name, support_email, sender_email, operator_emails, currency, reminder_days_before',
    )
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
  const groups = groupTargets(targets)
  const operatorRecipients = getOperatorRecipients(
    config,
    groups.map((group) => group.email),
  )

  if (auth.testEmail) {
    const group = groups[0]
    if (!group) {
      return json(200, {
        scanned: 0,
        sent: 0,
        failed: 0,
        skipped: 0,
        message: 'No hay servicios pendientes ni por cobrar para enviar',
      })
    }

    const email = buildEmail(group.targets, config)
    const deliveries: DeliveryResult[] = []
    const clientResult = await sendViaResend(
      from,
      auth.testEmail,
      email.subject,
      email.html,
      email.text,
    )
    deliveries.push({
      to: auth.testEmail,
      ok: clientResult.ok,
      error: clientResult.ok ? null : clientResult.error,
    })

    const summary = buildOperatorSummary(groups, config)
    for (const operator of getOperatorRecipients(config, auth.testEmail)) {
      if (!summary) break
      const result = await sendViaResend(
        from,
        operator,
        summary.subject,
        summary.html,
        summary.text,
      )
      deliveries.push({
        to: operator,
        ok: result.ok,
        error: result.ok ? null : result.error,
      })
    }

    const sent = deliveries.filter((delivery) => delivery.ok).length
    return json(sent > 0 ? 200 : 502, {
      scanned: group.targets.length,
      sent,
      failed: deliveries.length - sent,
      skipped: 0,
      test: true,
      recipient: auth.testEmail,
      service: group.targets.map((target) => target.serviceType).join(', '),
      results: deliveries,
    })
  }

  let sent = 0
  let failed = 0
  let skipped = 0
  let operatorSent = 0
  let operatorFailed = 0
  const nowMs = Date.now()
  const sentGroups: ReminderGroup[] = []

  for (const group of groups) {
    const sendable: ReminderTarget[] = []

    for (const target of group.targets) {
      const { data: previous } = await admin
        .from('reminder_logs')
        .select('status, sent_at')
        .eq('subscription_id', target.id)
        .eq('reminder_type', target.kind)
        .eq('billing_date', target.dueDate)
        .maybeSingle()

      if (shouldSend(target, previous as LogRow | null, nowMs)) {
        sendable.push(target)
      } else {
        skipped += 1
      }
    }

    if (sendable.length === 0) continue

    const email = buildEmail(sendable, config)
    const result = await sendViaResend(from, group.email, email.subject, email.html, email.text)
    const sentAt = new Date().toISOString()

    for (const target of sendable) {
      const { error: logError } = await admin.from('reminder_logs').upsert(
        {
          subscription_id: target.id,
          reminder_type: target.kind,
          billing_date: target.dueDate,
          status: result.ok ? 'sent' : 'failed',
          provider_id: result.ok ? result.id : null,
          error: result.ok ? null : result.error,
          sent_at: sentAt,
        },
        { onConflict: 'subscription_id,reminder_type,billing_date' },
      )

      if (logError) console.error('No se pudo registrar el recordatorio:', logError.message)
    }

    if (result.ok) sent += 1
    else failed += 1

    sentGroups.push({ email: group.email, clientName: group.clientName, targets: sendable })
  }

  const summary = buildOperatorSummary(sentGroups, config)
  if (summary) {
    for (const operator of operatorRecipients) {
      const operatorResult = await sendViaResend(
        from,
        operator,
        summary.subject,
        summary.html,
        summary.text,
      )
      if (operatorResult.ok) {
        operatorSent += 1
      } else {
        operatorFailed += 1
        console.error(`No se pudo enviar la copia al operador ${operator}:`, operatorResult.error)
      }
    }
  }

  return json(200, {
    scanned: targets.length,
    groups: groups.length,
    sent,
    failed,
    skipped,
    operatorSent,
    operatorFailed,
    operatorRecipients,
    from: fromAddress,
  })
})
