import { useMemo, useState } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown, Download, Eye, EyeOff, Printer, Search } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { SectionPreview } from '@/features/preview/components/section-preview'
import { briefSections } from '@/features/brief/sections'
import { useWorkspace } from '../workspace-context'
import { exportFormats } from '@/features/preview/exporters/export-registry'
import { cn } from '@/lib/utils/cn'
import { formatDate } from '@/lib/utils/date'
import { matchesQuery } from '@/lib/utils/text'
import {
  PRIORITY_META,
  STATUS_META,
  typeLabel,
} from '@/features/projects/lib/project-display'
import { serializeSection } from '@/features/preview/lib/serialize-brief'

export function PreviewTab() {
  const { project, pages, readiness } = useWorkspace()
  const [query, setQuery] = useState('')
  const [showEmpty, setShowEmpty] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const matchingSections = useMemo(() => {
    if (!query.trim()) return briefSections.map((section) => section.id)
    return briefSections
      .filter((section) =>
        matchesQuery(
          query,
          section.title,
          section.description,
          serializeSection(section, project, pages),
        ),
      )
      .map((section) => section.id)
  }, [query, project, pages])

  const visible = new Set(matchingSections)

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[16rem_minmax(0,1fr)]">
      <aside
        data-print="hide"
        className="xl:sticky xl:top-4 xl:max-h-[calc(var(--rs-tab-h,100dvh)-4rem)] xl:overflow-y-auto"
      >
        <div className="flex flex-col gap-4 rounded-card border border-border bg-surface-raised p-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search this brief…"
              aria-label="Search the brief"
              className="pl-9"
            />
          </div>

          <nav aria-label="Table of contents">
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Contents
            </h2>
            <ol className="flex flex-col gap-0.5">
              {briefSections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#preview-${section.id}`}
                    className={cn(
                      'flex items-baseline gap-2 rounded-[6px] px-2 py-1.5 text-sm transition-colors hover:bg-muted',
                      visible.has(section.id) ? 'text-foreground' : 'text-muted-foreground/40',
                    )}
                  >
                    <span className="tabular-nums text-muted-foreground">{index + 1}.</span>
                    <span className="min-w-0 flex-1 truncate">{section.title}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {readiness.sections[index]?.percent ?? 0}%
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <Button variant="secondary" size="sm" onClick={() => setShowEmpty((value) => !value)}>
              {showEmpty ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              {showEmpty ? 'Hide empty fields' : 'Show empty fields'}
            </Button>

            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer aria-hidden="true" />
              Print
            </Button>

            <ExportMenu />
          </div>
        </div>
      </aside>

      <article className="min-w-0">
        <header data-print="section" className="border-b border-border pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-text">
            Project brief
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{project.name}</h1>
          {project.client ? (
            <p className="mt-1 text-base text-muted-foreground">Prepared for {project.client}</p>
          ) : null}

          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            <HeaderFact label="Status" value={STATUS_META[project.status].label} />
            <HeaderFact label="Type" value={typeLabel(project.type)} />
            <HeaderFact label="Priority" value={PRIORITY_META[project.priority].label} />
            <HeaderFact label="Readiness" value={`${readiness.score}%`} />
            <HeaderFact label="Start" value={formatDate(project.startDate)} />
            <HeaderFact label="Target" value={formatDate(project.targetDate)} />
            <HeaderFact label="Lead designer" value={project.designer || '—'} />
            <HeaderFact label="Pages" value={String(pages.length)} />
          </dl>

          {project.description ? (
            <p className="mt-6 max-w-3xl text-sm leading-relaxed">{project.description}</p>
          ) : null}
        </header>

        {matchingSections.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nothing in this brief matches “{query.trim()}”.
          </p>
        ) : null}

        <div className="flex flex-col">
          {briefSections.map((section, index) => {
            if (!visible.has(section.id)) return null
            const completion = readiness.sections[index]
            const isOpen = !collapsed[section.id]

            return (
              <Collapsible.Root
                key={section.id}
                id={`preview-${section.id}`}
                open={isOpen}
                onOpenChange={(open) =>
                  setCollapsed((current) => ({ ...current, [section.id]: !open }))
                }
                data-print="section"
                className="scroll-mt-6 border-b border-border py-8 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <Collapsible.Trigger asChild>
                    <button
                      type="button"
                      className="group flex min-w-0 flex-1 items-start gap-3 text-left"
                    >
                      <ChevronDown
                        data-print="hide"
                        className={cn(
                          'mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform',
                          !isOpen && '-rotate-90',
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block text-xl font-semibold tracking-tight">
                          <span className="mr-2 text-muted-foreground tabular-nums">
                            {index + 1}
                          </span>
                          {section.title}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {section.description}
                        </span>
                      </span>
                    </button>
                  </Collapsible.Trigger>

                  <Badge
                    data-print="hide"
                    tone={completion?.status === 'complete' ? 'success' : 'neutral'}
                  >
                    {completion?.percent ?? 0}%
                  </Badge>
                </div>

                <Collapsible.Content className="pt-6 pl-7">
                  <SectionPreview
                    section={section}
                    project={project}
                    pages={pages}
                    showEmpty={showEmpty}
                  />
                </Collapsible.Content>
              </Collapsible.Root>
            )
          })}
        </div>

        <footer className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          Generated with ReqStudio · {formatDate(new Date().toISOString())} · Stored locally on this
          device
        </footer>
      </article>
    </div>
  )
}

function HeaderFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold">{value}</dd>
    </div>
  )
}

/**
 * Export formats come from a registry that Phase 2 populates (PDF, Word,
 * Markdown, HTML). Until then they render as disabled entries.
 */
function ExportMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" size="sm">
          <Download aria-hidden="true" />
          Export
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className="z-90 min-w-56 rounded-[10px] border border-border bg-surface-raised p-1 shadow-raised"
        >
          <DropdownMenu.Label className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Export formats
          </DropdownMenu.Label>
          {exportFormats.map((format) => (
            <DropdownMenu.Item
              key={format.id}
              disabled={!format.available}
              className="flex cursor-default items-center justify-between gap-3 rounded-[6px] px-2.5 py-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-muted"
            >
              {format.label}
              {!format.available ? (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  Soon
                </span>
              ) : null}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <p className="px-2.5 py-1.5 text-xs leading-relaxed text-muted-foreground">
            Print to PDF works today via your browser’s print dialog.
          </p>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
