# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: the owner of a single company, usually on a phone and in motion during the day. They open the panel to check clients, recurring subscriptions, payments and pending reminders, and to act quickly with as few taps as possible. Secondary users are operators (Auth users with a row in `public.operators`) who manage the same records from a desk or phone.

## Product Purpose

A focused single-tenant admin console for one company's recurring subscriptions. It must let the owner read the current state at a glance and perform the few frequent actions (create, edit, remove a client) without friction. Success is a trustworthy, fast check-and-act loop on a phone, with no ambiguity about who can see or change data.

## Positioning

One company, one dataset, one identity boundary: every table is protected by RLS through `public.is_operator()`, and the frontend holds only a publishable key. The product is deliberately narrow — free-text `plan_name` instead of a plans catalog — so the dashboard stays a working tool rather than a configurable platform.

## Operating Context

- Usage happens mostly on mobile web, often one-handed, with short sessions and quick glances.
- Login is Supabase Auth; a session must exist and the user must be registered in `public.operators`.
- The app is deployed from GitHub (`DevPyGabriel/Admin-Dashboard`, `main`) to Vercel; Supabase is an existing linked remote project used for test data.
- Language of the interface is Spanish; operators use `test.operator@example.com` for verification.

## Capabilities and Constraints

- Existing tables: `company_settings`, `operators`, `clients`, `subscriptions` (free-text `plan_name`), `payments`, `reminder_logs`.
- Client CRUD is implemented and verified against Supabase. Other modules are exposed as navigation but are not implemented yet; they must be labelled as upcoming, never as working features.
- Only two frontend env vars are allowed: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. No `sb_secret_*`, service-role key, DB password or `RESEND_API_KEY` may reach the bundle.
- Auth, data, RLS policies and the working CRUD flow must remain untouched by the visual/navigation work.
- Stack: strict TypeScript, `@/` alias, Tailwind CSS v4 CSS-first, shadcn/ui (Radix base, Nova preset), Inter Variable, TanStack Query, React Router.
- Only the existing Supabase project may be used; no new test project.
- Test rows use the `TEST_` prefix and are cleaned up after verification.

## Brand Commitments

- Product name: NovaDrive.
- The user pinned the visual reference: the interface should be as similar as possible to the UI of Supabase and Vercel, adapted to this dashboard.
- Green is the single accent color, used for primary action, focus, selection and success; grays/black/white form the foundation.

## Evidence on Hand

- `src/types/database.types.ts` generated from the linked remote project.
- Applied migrations: `20261119000000_core_schema.sql`, `20261119000100_grant_authenticated_access.sql`.
- `supabase/seed.test.sql` with `TEST_` rows and cleanup SQL.
- Visual system documented in `DESIGN.md`; implementation in `src/styles/index.css`, `src/app/layouts` and `src/components/ui`.
- Working auth and client CRUD in `src/features/auth` and `src/features/clients`.

## Product Principles

1. Mobile is the primary context: short sessions, big touch targets, one-handed reach, immediate readability.
2. Identity and RLS are the product boundary; never trade them for visual convenience.
3. Honest navigation: only working modules act like working modules.
4. One accent, one primary action per view; state is communicated by text plus color, never color alone.
5. Semantic tokens only in feature code, so the system can change without touching screens.

## Accessibility & Inclusion

WCAG AA contrast for body text and controls, visible keyboard focus, 44×44px minimum touch targets, reduced-motion support, and text labels on every status indicator.
