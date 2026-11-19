# Database migrations

Timestamped SQL migrations live here.

- `20261119000000_core_schema.sql` — initial single-tenant schema (company
  settings, operators, clients, subscriptions with free-text `plan_name`,
  payments, reminder logs) with RLS enabled.
- `20261119000100_grant_authenticated_access.sql` — explicit Data API grants for
  the `authenticated` role. RLS still decides which rows are visible.

The local database schema is the single source of truth for generated frontend
types (`npm run supabase:db:types`). `supabase/seed.sql` contains local-only sample
data applied by `supabase db reset`; `supabase/seed.test.sql` adds `TEST_`-prefixed
rows for the linked project.
