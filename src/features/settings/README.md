# Settings feature

Company configuration and reminder delivery controls.

- `components/` — settings page
- `hooks/` — settings data hooks
- `services/` / `api/` — Supabase data access
- `schemas/` — Zod schemas for settings forms

The `sender_email` column lives on the `company_settings` singleton. The Resend
API key is never read by the browser: it stays in Supabase Secrets and is used
by `supabase/functions/process-subscription-reminders`.
