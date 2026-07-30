# ReqStudio

A free, local-first studio for project requirements and website briefs — built for UX designers,
product designers, business analysts, product managers and project managers.

No account. No server. No AI. Every project lives in your browser's IndexedDB and never leaves the
device.

**Phase 1** — unlimited projects and pages, a ten-section brief with autosave, a readiness score,
and a print-ready preview report.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Vite dev server with HMR                      |
| `npm run build`     | Type-check then build to `dist/`              |
| `npm run typecheck` | `tsc -b` only                                 |
| `npm run lint`      | ESLint (flat config, typescript-eslint)       |
| `npm run preview`   | Serve the production build locally            |

## Tech stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · shadcn-style primitives on Radix ·
Lucide · Zustand · React Hook Form · Zod · React Router · Dexie (IndexedDB) · Manrope.

## Deployment

Everything is static — there is no backend.

**Vercel** — import the repo. `vercel.json` sets the SPA rewrite and asset caching.

**GitHub Pages** — `.github/workflows/deploy-pages.yml` builds and publishes on push to `main`.
Project sites are served from a sub-path, so the workflow passes `VITE_BASE=/<repo>/`; the router
picks that up via `import.meta.env.BASE_URL`, and the build emits a `404.html` copy of `index.html`
so deep links resolve.

---

## Architecture

Feature-first. Business logic lives in services and pure library functions; components render.

Left navigation is data-driven (`NAV_ITEMS` / `FOOTER_NAV_ITEMS` in `left-nav.tsx`) — Dashboard,
Projects, Recent and Templates sit at the top, Settings is pinned to the bottom above the collapse
control. Each view renders its own title; the top bar carries only search, save state and theme.

```
src/
├── app/                    Shell, router, error boundary
├── components/
│   ├── ui/                 Primitives (button, drawer, select, badge…)
│   ├── form/               Descriptor-driven field renderers
│   ├── layout/             Left nav, top bar, status bar, search
│   ├── drawers/            Drawer host + registry
│   └── common/             Empty state, confirm drawer, toaster, page header
├── features/
│   ├── projects/           Repos-facing services, hooks, cards, drawers
│   ├── brief/              Section registry, section form, readiness engine
│   ├── pages/              Page requirements pane, page drawers
│   ├── preview/            Report renderer, serializer, export registry
│   └── workspace/          Workspace shell + tab registry
├── lib/
│   ├── db/                 Dexie schema + repository pattern
│   ├── fields/             Schema builder, completion maths, value semantics
│   ├── hooks/              Autosave, theme, measured heights, debounce
│   └── utils/              cn, dates, ids, text
├── stores/                 Zustand: ui / project-view / settings
└── types/                  Entity, field, project, section, drawer
```

### The one idea worth knowing

**Brief sections describe themselves.** A section is a `SectionDefinition`: title, icon, weight, and
an array of `FieldDef` descriptors. From that single declaration the app derives

- the form (`FieldGrid` → `FieldRenderer` → `ScalarField` / `RepeaterInput`),
- the Zod validation schema (`lib/fields/schema.ts`),
- section completion and the weighted readiness score (`lib/fields/completion.ts`, `features/brief/lib/readiness.ts`),
- the outline with live percentages,
- the Preview report rendering,
- and the plain-text serialisation that Preview search runs against.

Adding an eleventh section is one new file plus one line in `features/brief/sections/index.ts`.
Nothing else changes. The same descriptors also drive the Create/Edit Project drawer and the Page
drawer, so there is exactly one implementation of every input type in the product.

A section that needs bespoke UI supplies a `pane` (and optionally `preview` and `completion`)
component — that is how **Page Requirements** stores pages in their own table while still
participating in scoring and the report.

### Data & storage

`lib/db/repository.ts` defines a `Repository<T>` interface with a Dexie implementation. Features
call services (`project-service.ts`, `page-service.ts`), services call repositories, and components
never touch Dexie. Every record carries `createdAt`, `updatedAt`, `deletedAt`, `revision` and
`syncState` — unused in Phase 1, written on every mutation so a cloud-sync adapter can diff local
against remote without a data migration.

Dexie versions are append-only: future schema changes add a `.version(n)` block rather than editing
version 1, so existing local data survives upgrades.

### Autosave

There is no Save button. `useAutosave` debounces (600 ms by default, configurable in Settings),
writes through the service layer, and flushes pending work on unmount and when the tab is hidden.
It compares the *pruned payload* against what is already stored, so merely opening a section never
writes. Status surfaces as "Saving… / Saved" in the top bar and status bar.

### Dashboard vs Projects

Three surfaces, three jobs, no overlap. **Dashboard** is a portfolio summary — stat tiles, a
"needs attention" list, a by-status breakdown that deep-links into a filtered Projects view, and
pinned work. It carries no filter toolbar and no project list of its own. **Projects** is the
browsing surface: the complete list with filter, sort and layout controls. **Recent** is that same
list ordered by last opened, and is the *only* place recently-opened projects are listed.

The attention rules (`features/projects/lib/attention.ts`) are pure functions over project
summaries — overdue targets, deadlines close with a thin brief, active projects with no pages — so
adding a rule never touches the page.

### Scroll ownership

The shell does not scroll. `<main>` is `overflow-hidden` and every route owns its own scroll
region, because the project workspace has to pin its header (title, readiness, tabs) and scroll only
the active tab — impossible if the shell scrolls the whole document as one.

The workspace measures its tab scrollport with a `ResizeObserver` and publishes the height as
`--rs-tab-h`. The Brief outline and the Preview table of contents cap themselves against that
variable, so both stay sticky and fully visible no matter how the header above them wraps.

### One search, two behaviours

The top bar owns the only search input in the product, and it reads and writes a single piece of
state (`project-store.search`). On a route that renders a project collection — Dashboard, Projects,
Recent — it filters that collection live. Anywhere else it opens a jump-to palette. ⌘K always focuses
it. There is deliberately no second search field on the dashboard toolbar.

### Drawers, with one deliberate exception

Every create, edit and detail surface is a right-side drawer built on one `Drawer` component (Radix
Dialog: focus trap, `aria-modal`, escape, scroll lock). `types/drawer.ts` holds a discriminated union
of overlay states; `components/drawers/drawer-registry.tsx` maps each variant to a component. The
store keeps a *stack*, so a drawer can open another (Delete from within Settings) and closing returns
you to the one beneath.

The exception is **destructive confirmation** — deleting a project or page, and resetting local data.
Those render `ConfirmDialog`, a centred modal on Radix AlertDialog, because an irreversible action
should interrupt the work rather than sit beside it. AlertDialog also gives the correct
`alertdialog` role and refuses to close on an outside click.

### State

Three separate Zustand stores, as intended:

- `ui-store` — drawer stack, save status, nav, toasts (ephemeral)
- `project-store` — search, filters, sort, layout (filters and layout persisted; the search term
  always starts empty)
- `settings-store` — theme, font size, autosave, hints (persisted; read by the inline
  no-flash theme script in `index.html`)

### Accessibility

WCAG AA is a build constraint, not a pass at the end. Skip link; single `<h1>` per view; labelled
controls with `aria-describedby` wiring help text and errors through one `FieldShell`; `role="alert"`
on validation messages; `aria-live` on save status and toasts; visible focus rings on every
interactive element; full keyboard operation including ⌘K search with arrow-key navigation;
`prefers-reduced-motion` honoured. The palette was chosen against contrast ratios — `#C74504` on
white is 4.9:1, and both themes are checked independently.

---

## Phase 2 extension points

These exist now and are deliberately unimplemented:

| Planned feature                        | Where it plugs in                                                       |
| -------------------------------------- | ----------------------------------------------------------------------- |
| PDF / Word / Markdown / HTML export     | `features/preview/exporters/export-registry.ts` — call `registerExporter`; the Preview menu already lists the formats and enables them automatically |
| Sitemap generator, complexity analysis | New workspace tab in `features/workspace/workspace-tabs.tsx` — routes and the tab bar follow |
| AI prompt generator                    | `features/preview/lib/serialize-brief.ts` already flattens a brief to text |
| Cloud sync                             | New `Repository<T>` implementation; entities already carry `revision` / `syncState` |
| Templates                              | Seed `SectionValues` from the existing section registry (nav entry is present and disabled) |
| More brief sections                     | One `SectionDefinition` file + one registry line                          |

## Licence

Free to use.
