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

- `RESEND_API_KEY` — Resend API key.
- `CRON_SECRET` — shared secret used by the `pg_cron` job (`x-cron-secret` header).

Operator-triggered calls use the normal Supabase session JWT. A request body of
`{ "testEmail": "someone@example.com" }` sends a single sample email to that
address instead of the client's address and does not write a reminder log. The
sample includes all services belonging to the first client with pending or
overdue items. Test mode also sends a `Copia operador:` copy to `support_email`
and every address in `operator_emails`, and includes services with
`auto_remind = false`; the scheduled job does not. In normal mode each grouped
reminder goes to the client and to those same operator inboxes, with
deduplicated recipients.

The cron job runs at 09:00 UTC and calls this function with `verify_jwt = false`
so the shared secret is evaluated inside the function.
