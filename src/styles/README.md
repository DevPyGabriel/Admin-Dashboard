# Styles

`index.css` is the single Tailwind CSS v4 entrypoint. It defines the primitive
neutral and green ramps in `:root`/`.dark`, maps semantic roles through
`@theme inline`, and declares the reusable `@utility` helpers.

The shipped language is a compact Supabase/Vercel-like shell: `#fafafa` canvas,
white surfaces, `#e6e8eb` hairlines, `#171717`/`#666666` type, `8px` panel radii
and no resting shadows. Green (`#00722e`) is the only accent.

Key utilities:

- `page-container` — responsive max-width and inline gutters.
- `surface-panel` — white, hairline-bordered, `8px` panel.
- `focus-ring`, `control-base` — accessible interactive treatments.
- `tabular-data`, `scrollbar-hidden`, `interactive`, `safe-bottom`.

Shell-specific roles live here too: `--topbar`, `--sidebar`, `--nav-active-bg`,
`--nav-active-foreground` and `--drawer-width`. Feature code consumes semantic
utilities (`bg-surface`, `text-muted-foreground`, `bg-primary`, `border-border`)
and never raw `--neutral-*` / `--brand-*` values.

The full system, contrast table and component rules live in
[`DESIGN.md`](../../DESIGN.md) at the project root.
