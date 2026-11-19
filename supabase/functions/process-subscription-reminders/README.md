# process-subscription-reminders Edge Function

Daily reminder job. It reads `company_settings` (including the verified Resend
sender address), selects active services with `auto_remind`, skips paid services
and sends one reminder per billing cycle via Resend. Each send is recorded in
`reminder_logs` to avoid duplicates.

Private configuration lives in Supabase Secrets, never in the client bundle:

- `RESEND_API_KEY` — Resend API key.
- `CRON_SECRET` — shared secret used by the `pg_cron` job (`x-cron-secret` header).

Operator-triggered calls use the normal Supabase session JWT. A request body of
`{ "testEmail": "someone@example.com" }` sends a single sample email to that
address instead of the client's address and does not write a reminder log.
Test mode includes services with `auto_remind = false`; the scheduled job does not.

The cron job runs at 09:00 UTC and calls this function with `verify_jwt = false`
so the shared secret is evaluated inside the function.
