import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/primitives'
import { SectionForm } from '@/features/brief/components/section-form'
import { SectionOutline } from '@/features/brief/components/section-outline'
import { briefSections, firstSectionId, getSection, sectionIndex } from '@/features/brief/sections'
import { useWorkspace } from '../workspace-context'
import { readinessBarClass } from '@/features/projects/lib/project-display'
import { useSettingsStore } from '@/stores/settings-store'

export function BriefTab() {
  const { project, pages, readiness } = useWorkspace()
  const [searchParams, setSearchParams] = useSearchParams()
  const showHints = useSettingsStore((state) => state.showCompletionHints)

  const requested = searchParams.get('section')
  const activeId = requested && getSection(requested) ? requested : firstSectionId
  const section = getSection(activeId)!
  const index = sectionIndex(activeId)
  const completion = readiness.sections[index]

  function select(sectionId: string) {
    setSearchParams((params) => {
      const next = new URLSearchParams(params)
      next.set('section', sectionId)
      return next
    })
    document.getElementById('section-heading')?.scrollIntoView({ block: 'nearest' })
  }

  const previous = index > 0 ? briefSections[index - 1] : undefined
  const next = index < briefSections.length - 1 ? briefSections[index + 1] : undefined
  const Icon = section.icon

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[17rem_1fr]">
      <aside className="lg:sticky lg:top-4 lg:max-h-[calc(var(--rs-tab-h,100dvh)-4rem)] lg:overflow-y-auto">
        <div className="rounded-card border border-border bg-surface-raised p-2">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Sections
            </span>
            <span className="text-xs font-semibold tabular-nums">{readiness.score}%</span>
          </div>
          <Progress
            value={readiness.score}
            className="mx-3 mb-2 w-[calc(100%-1.5rem)]"
            indicatorClassName={readinessBarClass(readiness.score)}
            aria-label="Overall brief completion"
          />
          <SectionOutline
            completions={readiness.sections}
            activeId={activeId}
            onSelect={select}
          />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-control bg-primary-soft text-primary-text">
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 id="section-heading" className="text-lg font-semibold tracking-tight">
                  <span className="mr-2 text-muted-foreground tabular-nums">{index + 1}</span>
                  {section.title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </div>

            <Badge
              tone={
                completion?.status === 'complete'
                  ? 'success'
                  : completion?.status === 'in-progress'
                    ? 'primary'
                    : 'neutral'
              }
              size="md"
            >
              {completion?.percent ?? 0}% complete
            </Badge>
          </div>

          {showHints && completion && completion.missingRequired.length > 0 ? (
            <p className="mt-4 rounded-control border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-foreground">
              <span className="font-semibold">Still required:</span>{' '}
              {completion.missingRequired.join(', ')}
            </p>
          ) : null}
        </header>

        <SectionForm
          key={`${project.id}:${section.id}`}
          section={section}
          project={project}
          pages={pages}
        />

        <nav
          aria-label="Section navigation"
          className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6"
        >
          {previous ? (
            <Button variant="secondary" onClick={() => select(previous.id)}>
              <ChevronLeft aria-hidden="true" />
              {previous.title}
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button variant="secondary" onClick={() => select(next.id)}>
              {next.title}
              <ChevronRight aria-hidden="true" />
            </Button>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  )
}
