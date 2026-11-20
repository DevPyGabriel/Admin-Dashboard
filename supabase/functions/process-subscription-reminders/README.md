# process-subscription-reminders Edge Function

Daily reminder job. It reads `company_settings` (including the verified Resend
sender address), selects active services with `auto_remind`, skips paid services
and sends one grouped reminder per client email: every unpaid service due within
`reminder_days_before` (3 days by default) plus every overdue service is listed
in the same message. Overdue services are re-sent every 3 days until the payment
is registered; upcoming reminders are sent once per billing cycle. Each service
is recorded in `reminder_logs` using `(subscription_id, reminder_type,
billing_date)` as the idempotency key.

Private configuration lives in Supabase Secrets, never in the client bundle:

- `RESEND_API_KEY` — main Resend API key (clients and fallback).
- `RESEND_API_KEY_ASSISTANT` — API key of the Resend account owned by
  `virginiarofe.05@gmail.com` (assistant operator copy).
- `RESEND_API_KEY_OWNER` — API key of the Resend account owned by
  `edwinfiu6b@gmail.com` (owner operator copy).
- `CRON_SECRET` — shared secret used by the `pg_cron` job (`x-cron-secret` header).

With the sandbox sender, each Resend account can only deliver to its own account
email. The two operator secrets make the report reach both inboxes. If an
operator secret is missing, the function falls back to `RESEND_API_KEY`, which
Resend will reject for that recipient until the account is created.

Operator-triggered calls use the normal Supabase session JWT. A request body of
`{ "testEmail": "someone@example.com" }` sends a single sample email to that
address instead of the client's address and does not write a reminder log. The
sample includes all services belonging to the first client with pending or
overdue items. Test mode also sends one consolidated `Copia operador:` summary
to `support_email` and every address in `operator_emails`, listing every client
with its services and amounts plus a grand subtotal when more than one service
applies; it includes services with `auto_remind = false`, while the scheduled job
does not. In normal mode each grouped reminder goes to its client, and a single
summary goes to those same operator inboxes, with deduplicated recipients.

The cron job runs at 09:00 UTC and calls this function with `verify_jwt = false`
so the shared secret is evaluated inside the function.
