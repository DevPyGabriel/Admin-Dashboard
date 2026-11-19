# Auth feature

Authentication and session handling.

- `components/` — `LoginForm` and the `RequireAuth` route guard
- `hooks/` — `useAuthSession`, backed by `supabase.auth.onAuthStateChange`
- `pages/` — `LoginPage`
- `schemas/` — Zod validation for the login form
- `types/` — feature-local types (reserved)

Supabase Auth calls currently live in `LoginForm`; extract them into `services/`
when more than one caller needs them.
