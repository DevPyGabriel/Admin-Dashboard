# Layouts

`DashboardLayout` is the authenticated app shell. It renders a persistent 240px
sidebar on `lg+` and the same `Sidebar` content inside a Radix drawer below
`lg`, so the mobile view keeps the full navigation in thumb reach.

- `navigation.ts` is the single source of truth for routes, icons and the
  honest `upcoming` status shown in the sidebar.
- `PlaceholderPage` renders those upcoming modules; no data logic is faked.
- The drawer closes on route change and traps focus through Radix Dialog.
- Auth still guards the whole shell in `src/app/router/router.tsx`.

Visual direction and token rules live in `DESIGN.md` at the project root.
