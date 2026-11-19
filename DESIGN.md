# NovaDrive design system

**Mode: Operate.** This is a subscription admin dashboard. Scanability, state
clarity and fast repeated actions outrank expression. The visual identity lives
in precise details: a calm neutral field, one deliberate green accent, and
consistent focus/status semantics.

## Direction

- **Neutral foundation:** near-black text, cool-neutral grays, white surfaces.
- **Single accent:** green is reserved for the primary action, selection, focus
  and success. It never decorates containers or headings.
- **Rarity gives force:** at most one primary green action per view. Secondary
  and ghost actions stay neutral.
- **Composed dark mode:** not an inverted light theme. Surfaces are darker and
  the accent switches to a brighter green with near-black foreground.

## Token layers

| Layer              | Location                                    | Rule                                                                                           |
| ------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Primitives         | `:root` / `.dark` in `src/styles/index.css` | `--neutral-*` and `--brand-*`; never used directly by features                                 |
| Semantic roles     | `:root` / `.dark`                           | `--canvas`, `--surface`, `--primary`, `--text-secondary`, `--danger-soft`, …                   |
| Tailwind utilities | `@theme inline`                             | `bg-surface`, `text-muted-foreground`, `ring-ring`, `shadow-panel`, `bg-brand-700`             |
| shadcn/ui bridge   | same file                                   | `bg-primary`, `bg-card`, `bg-popover`, `bg-destructive`, `border-input` map to the roles above |

Feature code consumes **semantic roles**. Use `--color-brand-*` only when a
specific shade is genuinely required (charts, illustrations).

## Color roles

| Role                      | Light                 | Dark                  | Use                                   |
| ------------------------- | --------------------- | --------------------- | ------------------------------------- |
| `canvas`                  | neutral-50 `#f9fbf9`  | neutral-950 `#070b08` | App background                        |
| `surface`                 | neutral-0 `#ffffff`   | neutral-900 `#141915` | Cards, tables, panels                 |
| `surface-raised`          | neutral-0             | neutral-800 `#222823` | Dialogs, popovers                     |
| `surface-muted`           | neutral-100 `#f2f5f3` | neutral-800           | Secondary rows, chips                 |
| `foreground`              | neutral-900 `#141915` | neutral-50            | Headings and body text                |
| `muted-foreground`        | neutral-600 `#525853` | neutral-300 `#d1d5d2` | Supporting text, labels               |
| `subtle-foreground`       | neutral-600           | neutral-400           | Placeholders                          |
| `border`                  | neutral-200 `#e5e8e5` | neutral-700 `#3c423d` | Separators                            |
| `border-strong` / `input` | neutral-300           | neutral-600           | Control outlines                      |
| `primary`                 | brand-700 `#00722e`   | brand-400 `#45bb68`   | Primary action, focus, selected state |
| `primary-hover`           | brand-800 `#005823`   | brand-300             | Hover only                            |
| `primary-foreground`      | white                 | neutral-950           | Text on primary                       |
| `primary-soft`            | brand-50 `#eafbec`    | dark green            | Selected rows, subtle chips           |
| `success`                 | brand-700             | brand-400             | Completed/paid/active                 |
| `warning`                 | amber-700 `#b45309`   | light amber           | Pending/needs attention               |
| `danger`                  | red-700 `#b91c1c`     | light red             | Destructive/error                     |
| `info`                    | blue-700 `#1d4ed8`    | light blue            | Neutral information                   |

## Accessibility verification

Measured with WCAG relative luminance. Body text requires 4.5:1; large text and
focus/control surfaces require 3:1.

| Pair                                        | Ratio                | Result |
| ------------------------------------------- | -------------------- | ------ |
| White on `primary` (light)                  | 6.08:1               | AA     |
| `primary` on `canvas` (light)               | 5.83:1               | AA     |
| `muted-foreground` on `canvas`              | 7.03:1               | AAA    |
| `muted-foreground` on white                 | 7.34:1               | AAA    |
| `success-soft-foreground` on `success-soft` | 8.06:1               | AAA    |
| `warning-soft-foreground` on `warning-soft` | 6.68:1               | AA     |
| `danger-soft-foreground` on `danger-soft`   | 7.60:1               | AAA    |
| `info-soft-foreground` on `info-soft`       | 8.01:1               | AAA    |
| White on `warning` / `danger` / `info`      | 5.02 / 6.47 / 6.70:1 | AA     |
| `primary` with near-black foreground (dark) | 8.07:1               | AAA    |
| `muted-foreground` on dark surface          | 11.96:1              | AAA    |

Focus rings use the full-strength `--ring` color, not a 50% alpha, so they stay
above 3:1 against their background. Generated shadcn primitives were adjusted
for this and for a tokenized `hover:bg-primary-hover`.

Color is never the only signal: status badges also carry text, and charts use
distinct lightness/chroma plus labels or patterns.

## Type, shape and motion

- **Font:** Inter Variable, self-hosted. `--font-sans` and `--font-heading`.
- **Headings:** `letter-spacing: -0.02em`, balanced wrapping. Never below
  `-0.04em`.
- **Body measure:** keep prose between 65–75ch.
- **Numerals:** `tabular-data` on tables, dates, money and metrics.
- **Radii:** `sm 6px`, `md 8px`, `lg 12px`, `xl 16px`, `2xl 20px`. Pills only for
  small controls/badges.
- **Elevation:** `shadow-panel` has a 1px offset plus soft blur;
  `shadow-popover` is stronger. Declare one elevation per surface, not a border
  plus a large halo.
- **Motion:** one authored easing (`--ease-out`) at 120ms for controls, 180ms for
  overlays. Reduced-motion is respected globally.

## Component rules

| Element | Rule                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------- |
| Button  | One `default` green per view. Others: `secondary`, `outline`, `ghost`. Hover uses `--primary-hover`, never opacity. |
| Input   | `border-input` at rest, `--ring` at focus, `--danger` on error. Placeholder uses `--subtle-foreground`.             |
| Card    | `surface-panel`: `bg-surface`, `border-border`, `radius-lg`, `shadow-panel`. No nested cards.                       |
| Badge   | Soft background + matching dark foreground (`*-soft-foreground`). Status text is mandatory.                         |
| Table   | `surface-panel` container, muted header, `tabular-data` numbers, 1px row separators.                                |
| Dialog  | `surface-raised` + `shadow-popover`. Focus stays trapped; Escape closes.                                            |
| Focus   | Keyboard focus must always be visible. Never `outline: none` without a replacement.                                 |
| Error   | `--danger` border/ring plus a text message that names the problem and recovery.                                     |

## Browser surfaces

Selection, caret, placeholders, scrollbars and tabular numerals are themed from
the palette. Do not reintroduce browser defaults in feature components.

## Adding a component

1. Add a shadcn primitive only if an existing one does not fit:
   `npx shadcn@latest add <component>`.
2. Replace opacity-based state colors with semantic tokens.
3. Verify light **and** dark states: default, hover, focus, error, disabled, empty.
4. Check contrast with the table above before merging.
5. Document only non-obvious conventions here.

See `src/styles/index.css` for the source of truth and `src/components/ui/README.md`
for the primitive inventory.
