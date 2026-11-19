# Subscription Admin

Frontend foundation for the subscription management dashboard. This repository
currently contains **infrastructure only** — no pages, features or business
logic have been implemented yet.

## Stack

- React + TypeScript (strict mode)
- Vite with the `@` → `src/` alias
- Tailwind CSS v4 via `@tailwindcss/vite` (CSS-first configuration)
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
├── app/          # providers, router and future shared layouts
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

## Supabase

Run `npm run supabase:start`, then `npm run supabase:db:types` once migrations
exist. Configure private backend secrets with `supabase secrets set ...`; they
are never part of the frontend bundle. Edge Functions live under
`supabase/functions/` and use the Deno runtime.
