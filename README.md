# Subscription Admin

Frontend for the NovaDrive subscription management dashboard. It includes
Supabase Auth, a working client CRUD flow, a responsive dashboard shell and an
honest set of placeholder routes for upcoming modules. Product truth lives in
`PRODUCT.md`; the visual system lives in `DESIGN.md`.

## Stack

- React + TypeScript (strict mode)
- Vite with the `@` → `src/` alias
- Tailwind CSS v4 via `@tailwindcss/vite` (CSS-first configuration)
- Compact Supabase/Vercel-aligned design system documented in `DESIGN.md`
- shadcn/ui primitives (Radix base, Nova preset) in `src/components/ui`
- Inter Variable, self-hosted through `@fontsource-variable/inter`
- TanStack Query for server state, React Router for routing
- React Hook Form + Zod for future forms
- Supabase JS for database/Auth/Edge Function access

## Getting started

```bash
npm install
cp .env.example .env.local
# Fill in the two VITE_ variables in .env.local
npm run dev
```

## Environment variables

| Variable                        | Purpose                         |
| ------------------------------- | ------------------------------- |
| `VITE_SUPABASE_URL`             | Supabase project URL            |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |

`.env.local` is git-ignored; `.env.example` is tracked. Never put a service-role
key, secret key or Resend API key into a `VITE_` variable — private credentials
belong in Supabase Secrets and are used only by Edge Functions.

## Project structure

```text
src/
├── app/          # providers, router and the authenticated dashboard shell
├── components/   # in-house ui primitives and shared components
├── features/     # business domains (auth, clients, subscriptions, ...)
├── hooks/        # global React hooks
├── lib/          # supabase client/functions, utils
├── styles/       # Tailwind entrypoint and design tokens
├── types/        # generated Supabase database types
└── main.tsx      # application bootstrap
supabase/         # CLI config, migrations, tests and Edge Functions
```

Each feature owns its components, hooks, services, schemas and types. Cross-feature
reusable code belongs in `components/shared`, primitives in `components/ui`, and
generic helpers in `lib/utils`.

## UI components

shadcn/ui is configured through `components.json`. Add primitives with:

```bash
npx shadcn@latest add <component>
```

Generated components live in `src/components/ui`. shadcn variables are mapped
to the compact neutral/green tokens in `src/styles/index.css`; `cn()` is
re-exported through `@/lib/utils/cn`.

Authenticated screens render inside `src/app/layouts/DashboardLayout.tsx`: a
240px rail on `lg+` and a Radix drawer below `lg`. Navigation and its honest
`upcoming` status are defined once in `src/app/layouts/navigation.ts`.

## Test CRUD flow

The app now includes a minimal authenticated CRUD against the existing Supabase
project:

```text
/login          sign in with an operator user
/clients        list, create, edit and delete rows from public.clients
/subscriptions  placeholder — upcoming module
/payments       placeholder — upcoming module
/reminders      placeholder — upcoming module
/settings       company sender email and reminder delivery controls
```

- `src/features/auth` provides `useAuthSession` and `RequireAuth`.
- `src/features/clients` uses TanStack Query + Zod + React Hook Form with the
  generated types from `src/types/database.types.ts`.
- `supabase/seed.test.sql` creates `TEST_`-prefixed demo rows. Run it in the
  Supabase SQL Editor after creating `test.operator@example.com` in Auth.

> This writes to the currently linked NovaDrive project. Use clearly prefixed
> test rows and remove them when finished.

## Vercel

`vercel.json` adds the SPA fallback for React Router. Import the repo with the
Vite preset (`npm run build`, output `dist`, install `npm ci`) and set only:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

in Vercel **Settings → Environment Variables**. Vite embeds these values at
build time, so redeploy after changing them. Add `https://*.vercel.app/**` to
the Supabase project's **Authentication → URL Configuration → Additional
Redirect URLs**.

`@emnapi/core` and `@emnapi/runtime` are pinned in `devDependencies`: npm on
Windows omits these optional WASM peer dependencies from the lockfile, which
makes `npm ci` fail on Vercel's Linux builders with `EUSAGE`. Keeping them
explicit makes the lockfile portable. Alternatively, set Vercel's install
command to `npm install`.

## Scripts

| Command                            | Description                                      |
| ---------------------------------- | ------------------------------------------------ |
| `npm run dev`                      | Start the Vite dev server                        |
| `npm run build`                    | Typecheck and create a production build          |
| `npm run preview`                  | Preview the production build                     |
| `npm run lint`                     | Run ESLint                                       |
| `npm run typecheck`                | Run TypeScript project checks                    |
| `npm run format`                   | Format files with Prettier                       |
| `npm run format:check`             | Check formatting                                 |
| `npm run supabase:start`           | Start the local Supabase stack (Docker required) |
| `npm run supabase:stop`            | Stop the local Supabase stack                    |
| `npm run supabase:functions:serve` | Serve Edge Functions locally                     |
| `npm run supabase:db:types`        | Generate `src/types/database.types.ts` locally   |
| `npm run supabase:db:push`         | Apply pending migrations to the linked project   |
| `npm run supabase:db:types:remote` | Generate types from the linked remote project    |

## Supabase

Run `npm run supabase:start`, then `npm run supabase:db:reset` to apply migrations
and local seed data, then `npm run supabase:db:types` to regenerate
`src/types/database.types.ts`.

The initial single-tenant schema creates `company_settings`, `operators`,
`clients`, `subscriptions` (free-text `plan_name`), `payments` and
`reminder_logs`, all protected by RLS. A follow-up migration grants the
`authenticated` role the Data API privileges those policies need; without the
grants, Postgres returns `permission denied for table ...` before RLS runs.
Configure private backend secrets with `supabase secrets set ...`; they are
never part of the frontend bundle. Edge Functions live under
`supabase/functions/` and use the Deno runtime.

### Recordatorios por correo

The `/settings` page stores the company name, support email and the verified
Resend sender address in `company_settings.sender_email`. Configure the private
credentials as Supabase Secrets (never in `VITE_*` or the frontend bundle):

```bash
npx supabase secrets set RESEND_API_KEY=re_... --project-ref <project-ref>
npx supabase secrets set CRON_SECRET=<random-value> --project-ref <project-ref>
```

Deploy the daily job and schedule it at 09:00 UTC:

```bash
npx supabase functions deploy process-subscription-reminders --project-ref <project-ref>
```

The `pg_cron` job uses `pg_net` and reads both the function URL and `CRON_SECRET`
from `supabase_vault`, so no credential is stored in the repository. The page's
"Enviar correo de prueba" button invokes the same function with the operator's
JWT and a `testEmail`, sending one sample to that address and a copy to every
configured operator inbox without writing a `reminder_logs` row. "Enviar todos
ahora" runs the exact batch path used by the cron job, so it is the fastest way
to test the automatic sender on demand.

Services due within `reminder_days_before` (3 days by default) and overdue
services are grouped into one email per client address; overdue services are
resent every 3 days until paid, while upcoming reminders are sent once per
billing cycle. A single operator summary is copied to `support_email` plus any
addresses in `company_settings.operator_emails` (comma-separated field in the
settings page). It lists every client by name with its services and amounts, and
includes a grand subtotal when more than one service applies. Operator copies are
deduplicated, exclude client addresses and have the subject prefix
`Copia operador:`. A failed operator copy is reported in the response but does
not change the client's `reminder_logs` status.

Until a domain is verified in **Resend → Domains**, set `sender_email` to
`onboarding@resend.dev`; Resend will only deliver to the email address associated
with your Resend account. To receive the client copy as well, verify your own
domain and use a `From` address on it, or temporarily point a test client's
`email` at that account address when testing.
