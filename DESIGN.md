---
name: NovaDrive
description: Compact Supabase/Vercel-style admin shell for subscription operations.
colors:
  primary: '#00722e'
  primary-hover: '#005823'
  primary-soft: '#eef9f1'
  nav-active-foreground: '#005823'
  canvas: '#fafafa'
  surface: '#ffffff'
  surface-muted: '#f5f6f7'
  foreground: '#171717'
  muted: '#666666'
  subtle: '#6b7280'
  border: '#e6e8eb'
  border-strong: '#e2e5e8'
  success: '#00722e'
  warning: '#b45309'
  danger: '#b91c1c'
  info: '#1d4ed8'
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

This is a compact, product-grade control surface in the lineage of Supabase and
Vercel dashboards: near-white ground, paper-white panels, hairline separators,
small radii, 14px type and almost no shadow. It is built for an owner checking
records on a phone in short sessions, so the hierarchy is flattened and the
frequent action stays close to the thumb. Brand expression is restricted to one
green used for action, selection, focus and success.

The system deliberately refuses the padded, floating-card dashboard and the
desktop sidebar that simply vanishes on mobile. Navigation is always reachable:
a 240px rail on large screens, the same content in a slide-in drawer below
`lg`. Modules that are not implemented are labelled `Pronto` instead of
pretending to work.

**Key Characteristics:**

- Hairline-first surfaces, flat at rest, with depth reserved for overlays.
- One accent green; neutral grays, black and white carry everything else.
- Compact desktop density, 44px touch targets on phones, one primary action per view.
- Honest navigation and text-labelled status in every state.

## Colors

The palette is a near-monochrome neutral ramp with one saturated green voice.

### Primary

- **Operator Green** (`#00722e`, `--brand-700`): Primary buttons, active nav rail, focus rings, success and selected states. White text on this green measures 6.09:1.
- **Deep Green** (`#005823`, `--brand-800`): Hover for primary controls and foreground on soft green chips.
- **Mint Wash** (`#eef9f1`, `--brand-50`): Active nav background, primary soft badges and selection.

### Neutral

- **Near-White Canvas** (`#fafafa`): App background.
- **Paper White** (`#ffffff`): Panels, tables, top bar and controls.
- **Quiet Gray** (`#f5f6f7`): Hover rows, muted chips and avatar fills.
- **Ink** (`#171717`): Titles and primary body text.
- **Secondary Ink** (`#666666`): Supporting copy, labels and inactive nav.
- **Placeholder Gray** (`#6b7280`): Placeholders and tertiary text.
- **Hairline** (`#e6e8eb`): Default borders and row separators.
- **Control Edge** (`#e2e5e8`): Input outlines and stronger separators.

### Signal colors

- **Signal Red** (`#b91c1c`): Destructive and error states, always paired with text.
- **Amber** (`#b45309`): Pending or attention-needed status.
- **Signal Blue** (`#1d4ed8`): Neutral information only; never competes with green.

**The One Voice Rule.** Green is the only accent. Do not introduce a second
brand hue for decoration; status colors are semantic exceptions with text
labels, not alternate accents.

### Accessibility verification

Measured with WCAG relative luminance against the shipped tokens.

| Pair                        | Ratio | Result |
| --------------------------- | ----- | ------ |
| `foreground` on `canvas`    | 17.18 | AAA    |
| `muted` on `white`          | 5.74  | AA     |
| `muted` on `canvas`         | 5.50  | AA     |
| `subtle` on `white`         | 4.83  | AA     |
| `primary` on `white`        | 6.09  | AA     |
| `primary` on `canvas`       | 5.84  | AA     |
| `primary` on `primary-soft` | 5.55  | AA     |
| White on `primary`          | 6.09  | AA     |
| `Deep Green` on `white`     | 8.68  | AAA    |
| White on `danger`           | 6.47  | AA     |
| White on `success`          | 6.09  | AA     |

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
inline padding at `sm` / `md` / `lg`. The app canvas sits behind white panels.

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
is slightly cooler than the white surface. Elevation appears only when content
leaves the page: dialogs and the mobile drawer use `--elevation-popover`
(`0 1px 2px oklch(0.15 0.01 150 / 0.06), 0 12px 32px oklch(0.15 0.01 150 / 0.12)`).
Focus is conveyed by a 2px primary ring with a 2px canvas offset.

**The Flat-By-Default Rule.** A resting panel gets one hairline border and no
shadow. Never stack a border with a large ambient halo.

## Shapes

Radii are deliberately small: `4px` for tiny chips, `6px` for buttons, inputs
and nav items, `8px` for panels, `10–12px` only for larger containers.
Status badges are the exception and use a pill silhouette. The active nav item
carries a `2px` green rail on its left edge, inset from the item bounds.

## Components

### Buttons

- **Shape:** `6px` radius. `sm` is the default size everywhere: `2rem` height,
  `0.75rem` horizontal padding and `0.875rem` label text. `xs`/`lg` are reserved
  for dense toolbars and page-level emphasis; icon sizes stay square.
- **Primary:** Operator Green background, white label; `hover` to Deep Green,
  `active` to the darker primary-active green.
- **Outline / Ghost:** white or transparent with hairline borders; neutral text,
  Quiet Gray hover and Hairline active fill. Destructive text uses Signal Red
  without a red fill.
- **Focus:** 2px primary ring with a 2px canvas offset. No translate-on-press;
  state changes come from color only.

### Inputs & Fields

- **Style:** white background, Control Edge border, `6px` radius, `0.875rem` text.
- **Focus:** border shifts to primary plus the same 2px offset ring used by buttons.
- **Error / Disabled:** destructive border and message; disabled controls reduce opacity and block pointer events.

### Cards & Panels

- **Corner Style:** `8px` radius via `.surface-panel`.
- **Background:** Paper White on the Near-White Canvas.
- **Border:** one `1px` Hairline border; no shadow.
- **Internal Rhythm:** `1rem` list padding, `0.75rem` header row, `1px` row dividers.

### Badges

- **Style:** pill, soft green for active/success, Quiet Gray with Secondary Ink
  for inactive. Always include the textual state.
- **Upcoming nav chip:** small neutral `Pronto` tag, never a green promotional pill.

### Navigation

- **Desktop:** 36px high items, 16px icons, 14px labels; inactive text is
  Secondary Ink, active text is Deep Green on Mint Wash with the 2px green rail.
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
