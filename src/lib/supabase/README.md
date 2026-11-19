# Supabase integration

- `client.ts` creates and exports the single browser Supabase client. It reads
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from `import.meta.env`
  and fails fast when either is missing.
- `functions.ts` provides `invokeEdgeFunction<Response, Request>()`, the shared
  typed wrapper around `supabase.functions.invoke` with centralized errors.
- `src/types/database.types.ts` is the destination for CLI-generated database
  types (`npm run supabase:db:types`).

Only publishable credentials belong here. Service-role keys, secret keys and
Resend credentials must stay in Supabase Secrets and be used from Edge Functions.
