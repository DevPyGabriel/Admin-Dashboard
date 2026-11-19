---
name: NovaDrive
description: Dark-first compact Supabase/Vercel-style admin shell for subscription operations.
colors:
  primary: '#45bb68'
  primary-hover: '#7bd890'
  primary-soft: 'oklch(0.26 0.055 150)'
  nav-active-foreground: '#7bd890'
  canvas: '#0a0a0a'
  surface: '#171717'
  surface-raised: '#262626'
  surface-muted: '#262626'
  foreground: '#fafafa'
  muted: '#9ca3af'
  subtle: '#9ca3af'
  border: '#262626'
  border-strong: '#444444'
  success: '#45bb68'
  warning: 'oklch(0.82 0.13 75)'
  danger: 'oklch(0.76 0.15 25)'
  danger-soft: 'oklch(0.3 0.09 25)'
  info: 'oklch(0.78 0.11 250)'
  overlay: 'rgb(0 0 0 / 0.6)'
typography:
  title:
    fontFamily: 'Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: '-0.02em'
  body:
    fontFamily: 'Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: '0'
  meta:
    fontFamily: 'Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.625rem'
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: '0.05em'
  meta-relaxed:
    fontFamily: 'Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.6875rem'
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: '0'
rounded:
  sm: '4px'
  md: '6px'
  lg: '8px'
  xl: '10px'
  '2xl': '12px'
  full: '9999px'
spacing:
  page-x-sm: '1rem'
  page-x-md: '1.5rem'
  page-x-lg: '2rem'
  topbar: '3.5rem'
  rail: '15rem'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.surface}'
    rounded: '{rounded.md}'
    padding: '0 0.75rem'
    height: '2rem'
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
    textColor: '{colors.surface}'
    rounded: '{rounded.md}'
  button-outline:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.md}'
    padding: '0 0.75rem'
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.md}'
    padding: '0.25rem 0.625rem'
    height: '2rem'
  card-surface:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.lg}'
  nav-active:
    backgroundColor: '{colors.primary-soft}'
    textColor: '{colors.nav-active-foreground}'
    rounded: '{rounded.md}'
  status-badge:
    backgroundColor: '{colors.primary-soft}'
    textColor: '{colors.nav-active-foreground}'
    rounded: '9999px'
---

# Design System: NovaDrive

## Overview

**Creative North Star: "The Operator's Console."**

This is a compact, product-grade dark control surface in the lineage of Supabase
and Vercel dashboards: near-black ground, charcoal panels, hairline separators,
small radii, 14px type and almost no shadow. Dark is the shipped default — the
`dark` class lives on `<html>` — so the light ramp remains a compatibility
fallback, not a second product theme. It is built for an owner checking records
on a phone in short sessions, so the hierarchy is flattened and the frequent
action stays close to the thumb. Brand expression is restricted to one brighter
green used for action, selection, focus and success.

The system deliberately refuses the padded, floating-card dashboard and the
desktop sidebar that simply vanishes on mobile. Navigation is always reachable:
a 240px rail on large screens, the same content in a slide-in drawer below
`lg`. Modules that are not implemented are labelled `Pronto` instead of
pretending to work.

**Key Characteristics:**

- Dark-first surfaces with near-black canvas and charcoal panels.
- Hairline-first surfaces, flat at rest, with depth reserved for overlays.
- One brighter accent green; neutral grays carry everything else.
- Compact desktop density, 44px touch targets on phones, one primary action per view.
- Honest navigation and text-labelled status in every state.

## Colors

The shipped palette is a near-black neutral ramp with one brighter green voice.
The light ramp in `:root` remains a compatibility fallback; `.dark` is applied to
`<html>` and owns every value below.

### Primary

- **Operator Green** (`#45bb68`, `--brand-400`): Primary buttons, active nav
  rail, focus rings, success and selected states. Near-black label text on this
  green measures 8.07:1.
- **Light Green** (`#7bd890`, `--brand-300`): Hover for primary controls and
  foreground on soft green chips.
- **Pale Green** (`#b3e4c2`, `--brand-200`): Pressed primary state.
- **Deep Green Wash** (`oklch(0.26 0.055 150)`): Active nav background and
  primary soft badges.

### Neutral

- **Near-Black Canvas** (`#0a0a0a`): App background and top bar.
- **Charcoal Surface** (`#171717`): Panels, tables and controls.
- **Raised Charcoal** (`#262626`): Hover rows, muted chips, inputs and avatars.
- **Soft White** (`#fafafa`): Titles and primary body text.
- **Muted Gray** (`#9ca3af`): Supporting copy, labels, placeholders and
  inactive nav.
- **Hairline** (`#262626`): Default borders and row separators.
- **Control Edge** (`#444444`): Input outlines and stronger separators.

### Signal colors

- **Signal Red** (`oklch(0.76 0.15 25)`): Destructive and error states, always
  paired with text. As text on charcoal it measures 7.76:1.
- **Amber** (`oklch(0.82 0.13 75)`): Pending or attention-needed status.
- **Signal Blue** (`oklch(0.78 0.11 250)`): Neutral information only; never
  competes with green.

**The One Voice Rule.** Green is the only accent. Do not introduce a second
brand hue for decoration; status colors are semantic exceptions with text
labels, not alternate accents.

### Accessibility verification

Measured with WCAG relative luminance against the shipped dark tokens.

| Pair                              | Ratio | Result |
| --------------------------------- | ----- | ------ |
| `foreground` on `canvas`          | 18.97 | AAA    |
| `muted` on `surface`              | 7.06  | AA     |
| `muted` on `canvas`               | 7.80  | AA     |
| `primary` on `surface`            | 7.31  | AA     |
| `primary` on `canvas`             | 8.07  | AA     |
| Active nav text on nav background | 8.79  | AA     |
| `primary-foreground` on `primary` | 8.07  | AA     |
| Signal Red on `surface`           | 7.76  | AA     |
| Soft-red text on soft-red chip    | 8.96  | AA     |
| Soft-red text on danger hover     | 7.77  | AA     |
| Soft-red text on danger active    | 6.15  | AA     |
| Amber text on soft-amber chip     | 9.48  | AA     |
| Info text on soft-info chip       | 9.39  | AA     |

Focus rings use a `2px` full-strength `--ring`/`--primary-ring` outline with a
`2px` canvas offset, never a low-alpha halo. Status is always text plus color,
never color alone.

## Typography

**Display / Body / Label Font:** Inter Variable, self-hosted, with
`Inter, ui-sans-serif, system-ui, sans-serif` fallbacks.

**Character:** Neutral, dense and interface-first. Tight tracking on headings,
regular weight for data, and small uppercase kickers for navigation groups.

### Hierarchy

- **Page title:** 600, `1.25rem` / `1.5rem` at `sm`, line-height 1.3, `-0.02em` tracking.
- **Panel title:** 600, `0.875rem`, line-height 1.25.
- **Body:** 400, `0.875rem`, line-height 1.5.
- **Label / kicker:** 500–600, `0.75rem` (12px), uppercase with `0.05em` tracking for group labels.
- **Meta:** 500 at `0.625rem` (10px) for upcoming chips; 400 at `0.6875rem` (11px) for sidebar subtitles and email.
- **Data:** numeric cells use `tabular-data` for aligned dates, phones and counts.
- **Icons:** 16px stroke icons (`size-4`) inside controls and nav; 20px only for the menu trigger.

## Layout

`page-container` caps content at `80rem` with `1rem` / `1.5rem` / `2rem`
inline padding at `sm` / `md` / `lg`. The near-black canvas sits behind charcoal panels.

- **Mobile first:** a sticky `56px` top bar carries the logo, a 44px hamburger
  and the operator avatar. Page title and its single primary action stack, with
  the action full-width. Client records render as one card per row with actions
  inside thumb reach. `safe-bottom` respects the home indicator.
- **`lg+`:** a fixed `240px` sidebar holds workspace, grouped navigation and the
  user footer; content is offset by `lg:pl-60`. The top bar shows the section
  label instead of the logo.
- **Below `lg`:** the sidebar becomes a `280px` Radix drawer (`max-w-[85vw]`)
  with overlay and focus trap. It closes on route change.
- **At `md+`:** the client card list gives way to a dense table with the same
  data and handlers.

## Elevation & Depth

The system is flat by default. Borders, not shadows, define panels; the canvas
is one step darker than the surface. Elevation appears only when content leaves
the page: dialogs and the mobile drawer use `--elevation-popover`
(`0 1px 2px oklch(0 0 0 / 0.4), 0 14px 40px oklch(0 0 0 / 0.5)`), over a
`rgb(0 0 0 / 0.6)` overlay. Focus is conveyed by a 2px primary ring with a 2px
canvas offset.

**The Flat-By-Default Rule.** A resting panel gets one hairline border and no
shadow. Never stack a border with a large ambient halo.

## Shapes

Radii are deliberately small: `4px` for tiny chips, `6px` for buttons, inputs
and nav items, `8px` for panels, `10–12px` only for larger containers.
Status badges and the active nav rail use the documented `9999px` pill radius.
The active nav item carries a `2px` green rail on its left edge, inset from the
item bounds.

## Components

### Buttons

- **Shape:** `6px` radius. `sm` is the default size everywhere: `2rem` height,
  `0.75rem` horizontal padding and `0.875rem` label text. `xs`/`lg` are reserved
  for dense toolbars and page-level emphasis; icon sizes stay square.
- **Primary:** Operator Green background, near-black label; `hover` to Light
  Green and `active` to Pale Green.
- **Outline / Ghost:** charcoal or transparent with hairline borders; soft-white
  text, Raised Charcoal hover and Hairline active fill. Destructive text uses
  Signal Red, or a soft-red chip with lighter red text on hover and press; no
  solid red fill.
- **Focus:** 2px primary ring with a 2px canvas offset. No translate-on-press;
  state changes come from color only.

### Inputs & Fields

- **Style:** charcoal background, Control Edge border, `6px` radius, `0.875rem`
  text and Muted Gray placeholders.
- **Focus:** border shifts to primary plus the same 2px offset ring used by buttons.
- **Error / Disabled:** destructive border and message; disabled controls reduce opacity and block pointer events.

### Cards & Panels

- **Corner Style:** `8px` radius via `.surface-panel`.
- **Background:** Charcoal Surface on the Near-Black Canvas.
- **Border:** one `1px` Hairline border; no shadow.
- **Internal Rhythm:** `1rem` list padding, `0.75rem` header row, `1px` row dividers.

### Badges

- **Style:** pill, soft green for active/success, Raised Charcoal with Muted Gray
  for inactive. Always include the textual state.
- **Upcoming nav chip:** small neutral `Pronto` tag, never a green promotional pill.

### Navigation

- **Desktop:** 36px high items, 16px icons, 14px labels; inactive text is
  Muted Gray, active text is Light Green on Deep Green Wash with the 2px green
  rail.
- **Mobile:** 44px high drawer items with the same visual states; focus remains
  trapped until the drawer closes.
- **Sign out:** icon-only button with an accessible name in the footer.

### Client list

- **Mobile:** stacked cards with name, email, status, phone, creation date and
  two full-width outline actions.
- **Desktop:** bordered table with muted headers, tabular dates and ghost
  row actions.

## Do's and Don'ts

### Do:

- **Do** use semantic utilities such as `bg-surface`, `text-muted-foreground`, `bg-primary` and `border-border`.
- **Do** keep one primary green action per view and make it full-width on phones.
- **Do** give every control a visible focus ring and every touch target at least 44px on coarse pointers.
- **Do** label upcoming modules and empty states with plain Spanish copy.
- **Do** use `tabular-data` for anything numeric or date-based.

### Don't:

- **Don't** add shadows to resting cards or panels; depth is for overlays only.
- **Don't** use color alone for state, or introduce a second accent hue.
- **Don't** hide navigation on mobile without providing the drawer equivalent.
- **Don't** use raw `--brand-*` or `--neutral-*` values in feature code.
- **Don't** claim an unimplemented module works; route it to the honest placeholder.
