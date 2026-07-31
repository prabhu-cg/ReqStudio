import {
  FileText,
  LayoutTemplate,
  Library,
  Network,
  Server,
  ShieldAlert,
  SlidersHorizontal,
  Stamp,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react'

interface SectionRow {
  label: string
  percent: number
  icon: LucideIcon
}

/** Mirrors the real brief outline, so the marketing shot never goes stale. */
const SECTIONS: SectionRow[] = [
  { label: 'Project Overview', percent: 100, icon: FileText },
  { label: 'Business Goals', percent: 100, icon: Target },
  { label: 'Target Audience', percent: 82, icon: Users },
  { label: 'Website Structure', percent: 74, icon: Network },
  { label: 'Page Requirements', percent: 66, icon: LayoutTemplate },
  { label: 'Functional Requirements', percent: 48, icon: SlidersHorizontal },
  { label: 'Content Inventory', percent: 30, icon: Library },
  { label: 'Technical Requirements', percent: 12, icon: Server },
  { label: 'Risks & Assumptions', percent: 0, icon: ShieldAlert },
  { label: 'Approvals', percent: 0, icon: Stamp },
]

function barTone(percent: number) {
  if (percent >= 100) return 'bg-success'
  if (percent >= 75) return 'bg-primary'
  if (percent >= 40) return 'bg-warning'
  return 'bg-primary/40'
}

/**
 * A rendering of the product rather than a screenshot — it stays sharp at any
 * size, respects dark mode, and never drifts out of date with a redesign.
 */
export function AppPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#f87171]" />
          <span className="size-2.5 rounded-full bg-[#fbbf24]" />
          <span className="size-2.5 rounded-full bg-[#4ade80]" />
        </span>
        <span className="ml-3 hidden rounded-[6px] border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground sm:block">
          Northwind Corporate Site · Brief
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-success">
          <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Saved
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[13rem_1fr] sm:p-5">
        <aside className="rounded-[10px] border border-border bg-muted p-2">
          <div className="flex items-baseline justify-between px-2 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Sections
            </span>
            <span className="text-[11px] font-semibold tabular-nums">51%</span>
          </div>
          <div className="mx-2 mb-2 h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[51%] rounded-full bg-primary" />
          </div>

          <ul className="flex flex-col gap-0.5">
            {SECTIONS.map((section, index) => {
              const Icon = section.icon
              const active = index === 4
              return (
                <li
                  key={section.label}
                  className={`flex items-center gap-2 rounded-[6px] px-2 py-1.5 ${
                    active ? 'bg-primary/10' : ''
                  }`}
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-[6px] border ${
                      section.percent >= 100
                        ? 'border-success/30 bg-success/10 text-success'
                        : section.percent > 0
                          ? 'border-primary/25 bg-primary/10 text-primary-text'
                          : 'border-border bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="size-3" aria-hidden="true" />
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-[11px] font-medium ${
                      active ? 'text-primary-text' : ''
                    }`}
                  >
                    {section.label}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {section.percent}%
                  </span>
                </li>
              )
            })}
          </ul>
        </aside>

        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-primary/10 text-primary-text">
              <LayoutTemplate className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold tracking-tight">
                <span className="mr-2 text-muted-foreground tabular-nums">5</span>
                Page Requirements
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                Every page in the build, with its purpose, calls to action and content needs.
              </p>
            </div>
            <span className="hidden shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary-text sm:block">
              66% complete
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {[
              { name: 'Home', cta: 'Book a demo', percent: 92 },
              { name: 'Pricing', cta: 'Start free trial', percent: 78 },
              { name: 'Case studies', cta: 'Read the story', percent: 54 },
              { name: 'Contact', cta: 'Send enquiry', percent: 31 },
            ].map((page, index) => (
              <div
                key={page.name}
                className="flex items-center gap-3 rounded-[10px] border border-border bg-muted px-3 py-2.5"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-[6px] bg-muted text-[10px] font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">{page.name}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    CTA: {page.cta}
                  </span>
                </span>
                <span className="hidden h-1 w-20 overflow-hidden rounded-full bg-muted sm:block">
                  <span
                    className={`block h-full rounded-full ${barTone(page.percent)}`}
                    style={{ width: `${page.percent}%` }}
                  />
                </span>
                <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                  {page.percent}%
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[10px] border border-border bg-muted p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Readiness score
              </span>
              <span className="text-lg font-bold tabular-nums tracking-tight">51%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[51%] rounded-full bg-warning" />
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              <span className="font-semibold">Missing:</span> Technical Requirements, Risks &amp;
              Assumptions, Approvals
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
