# Database migrations

Timestamped SQL migrations live here. `20261119000000_core_schema.sql` creates the
initial single-tenant schema: company settings, operators, clients, subscriptions
(with free-text `plan_name`), payments and reminder logs.

The local database schema is the single source of truth for generated frontend
types (`npm run supabase:db:types`). `supabase/seed.sql` contains local-only sample
data applied by `supabase db reset`.
