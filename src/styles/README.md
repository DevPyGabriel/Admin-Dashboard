# Styles

`index.css` is the single Tailwind CSS v4 entrypoint. It defines the primitive
ramps and semantic roles in `:root`/`.dark`, maps them to Tailwind and shadcn/ui
through `@theme inline`, and declares the reusable `@utility` helpers.

The full design system — palette, contrast ratios, dark-mode rules and component
conventions — lives in [`DESIGN.md`](../../DESIGN.md) at the project root.

Feature code should consume semantic utilities (`bg-surface`,
`text-muted-foreground`, `bg-primary`, `bg-danger-soft`) and never raw
`--neutral-*` / `--brand-*` values directly.
