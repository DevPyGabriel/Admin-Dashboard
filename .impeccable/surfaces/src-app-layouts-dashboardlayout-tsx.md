---
version: 1
slug: 'src-app-layouts-dashboardlayout-tsx'
primary_target: 'src/app/layouts/DashboardLayout.tsx'
related_targets: ['src/app/router/router.tsx', 'src/features/clients/components/ClientsPage.tsx']
---

## Scope

Target: the authenticated dashboard shell, sidebar and client list. Mode: Operate. Audience: owner on a phone, short sessions, few taps.

## Direction contract

THESIS: A Supabase/Vercel-grade admin shell — hairline borders, compact type, small radii, near-white ground — rebuilt for one-handed phone use. It refuses the padded, shadowed card dashboard and the desktop sidebar that merely disappears on mobile.

OWN-WORLD: `#fafafa` canvas, white surfaces, `#e6e8eb` hairlines, `#171717` / `#666` type, 8px radii, almost no elevation. One accessible green for primary action, selection and status; a 2px green rail marks the active nav item. Inter at fixed rem steps, 16px stroke icons.

STORY: The owner opens the panel on a phone, knows the section instantly, reaches the frequent action in one tap. Every module is visible; unimplemented ones are honestly labelled upcoming.

FIRST VIEWPORT: Mobile: 56px sticky top bar with logo, hamburger and avatar; page title with one primary button; the first client card visible without scrolling. Desktop: 240px full-height sidebar (workspace, grouped nav, user footer) plus top bar; content starts top-left with the list.

FORM: Standard web shell — persistent side rail at lg+, slide-in drawer below lg — first of the adaptation options (drawer, bottom tabs, collapsible rail). seed: none (unavailable).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
