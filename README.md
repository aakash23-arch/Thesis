# Thesis

An instrument of intellectual discipline applied to money.

Thesis tracks _why_ you hold each investment, and tells you when those reasons stop holding.
It never issues buy, sell, or hold recommendations — it surfaces your own data and your own
rules back to you.

## Stack

Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS · Prisma + PostgreSQL (Supabase) ·
Zustand · React Hook Form + Zod · Radix UI · Recharts · Framer Motion

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values -- see SUPABASE_SETUP.md
npm run prisma:generate
npm run dev               # http://localhost:3000
```

`.env` is required before any `prisma:*` script will run: the datasource block reads
`DATABASE_URL` and `DIRECT_URL`, and Prisma fails with `P1012 Environment variable not found`
if they are absent. `npm run dev` and `npm run build` work without it, because nothing queries
the database yet.

## Scripts

| Script                    | Purpose                                                  |
| ------------------------- | -------------------------------------------------------- |
| `npm run dev`             | Dev server                                                |
| `npm run build`           | Production build                                          |
| `npm run verify`          | format:check + lint + typecheck + build — run before commit |
| `npm run format`          | Prettier write across the repo                            |
| `npm run lint`            | ESLint (`next/core-web-vitals`)                           |
| `npm run typecheck`       | `tsc --noEmit`                                            |
| `npm run prisma:migrate`  | Create/apply a migration                                  |
| `npm run prisma:studio`   | Browse the database                                       |
| `npm run prisma:format`   | Format `schema.prisma`                                    |

## Layout

```
src/
  app/(dashboard)/     Routes inside the sidebar shell
    styleguide/        Visual QA surface — every primitive, one page
  components/
    ui/                Design-system primitives
    layout/            Sidebar, topbar, page header
    thesis/            ThesisGauge — the signature instrument
  lib/                 utils, format, contrast, health-score, hooks, store
prisma/schema.prisma   13 core tables
```

## Design system

The full identity ("The Research Instrument") lives in
`Documentation/thesis_build_plan.md.pdf`. The rules that constrain day-to-day work:

- **Typography is the interface.** Instrument Serif for page titles and hero figures only;
  Inter for everything else; IBM Plex Mono for every number.
- **Colour is signal, not decoration.** Green/amber/red appear only to communicate
  thesis health. Signal colours are for _fills_; their `-ink` twins are the WCAG-AA-passing
  text versions.
- **Borders, not shadows.** `theme.boxShadow` is overridden to `none` only, so this is
  enforced by the config rather than by discipline.
- **The product reads like a document, not a dashboard.** Vertical flow, 1120px max width.

`/styleguide` renders every primitive and computes its own contrast audit — check changes
there at 375px, 900px, and 1280px.

## Compliance

Thesis never phrases a next step. Alerts echo the user's own rule text verbatim, extracted
data carries a source and confidence label, and every analytical page carries `<Disclaimer />`.
