# UI primitives

Primitive components are generated and owned by shadcn/ui (Radix base, Nova
preset) and live in this folder. They are copied into the repo, so they can be
edited freely.

Add more primitives with:

```bash
npx shadcn@latest add <component>
```

Configuration: `components.json` at the project root.

- Theme tokens and `@theme inline` mappings: `src/styles/index.css`
- Shared `cn()` helper: `src/lib/utils/cn.ts` (re-exported as `@/lib/utils`)

Currently available: `button`, `input`, `label`, `card`, `badge`, `table`, `dialog`.
