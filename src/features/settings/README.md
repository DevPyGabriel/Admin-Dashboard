# Settings feature

Company configuration and reminder delivery controls.

- `components/` — settings page
- `hooks/` — settings data hooks
- `services/` / `api/` — Supabase data access
- `schemas/` — Zod schemas for settings forms

The `sender_email` and `operator_emails` columns live on the `company_settings`
singleton. `support_email` is the contact address in the email body and also
receives a copy of every reminder, together with the addresses in
`operator_emails`. The Resend API key is never read by the browser: it stays in
Supabase Secrets and is used by `supabase/functions/process-subscription-reminders`.
