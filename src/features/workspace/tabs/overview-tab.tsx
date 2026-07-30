import { ArrowRight, CalendarClock, FileStack, Flag, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/primitives'
import { ReadinessPanel } from '@/features/brief/components/readiness-panel'
import { useWorkspace } from '../workspace-context'
import { PRIORITY_META, readinessBarClass, typeLabel } from '@/features/projects/lib/project-display'
import { formatDate, formatRelative, daysUntil } from '@/lib/utils/date'
import { pluralize } from '@/lib/utils/text'
import { briefSections } from '@/features/brief/sections'
import type { ReactNode } from 'react'

export function OverviewTab() {
  const { project, pages, readiness, goToSection } = useWorkspace()
  const days = daysUntil(project.targetDate)

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
      <div className="flex flex-col gap-6">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<FileStack className="size-4" aria-hidden="true" />}
            label="Pages"
            value={String(pages.length)}
            hint={pages.length === 0 ? 'None defined yet' : pluralize(pages.length, 'page')}
          />
          <StatCard
            icon={<Flag className="size-4" aria-hidden="true" />}
            label="Priority"
            value={PRIORITY_META[project.priority].label}
            hint={typeLabel(project.type)}
          />
          <StatCard
            icon={<CalendarClock className="size-4" aria-hidden="true" />}
            label="Target date"
            value={formatDate(project.targetDate)}
            hint={
              days === null
                ? 'Not set'
                : days < 0
                  ? `${Math.abs(days)} days overdue`
                  : `${days} days remaining`
            }
          />
          <StatCard
            icon={<Users className="size-4" aria-hidden="true" />}
            label="Stakeholders"
            value={String(project.stakeholders.length)}
            hint={project.designer ? `Lead: ${project.designer}` : 'No lead designer'}
          />
        </section>

        {project.description ? (
          <section className="rounded-card border border-border bg-surface-raised p-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Description
            </h2>
            <p className="mt-2 text-sm leading-relaxed">{project.description}</p>
            {project.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge key={tag} tone="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="rounded-card border border-border bg-surface-raised p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Section progress
            </h2>
            <Button variant="ghost" size="sm" asChild>
              {/* Absolute: a relative `to` resolves against the *overview* route,
                  which would produce /projects/:id/overview/brief. */}
              <Link to={`/projects/${project.id}/brief`}>
                Open brief
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="mt-4 flex flex-col divide-y divide-border">
            {briefSections.map((section, index) => {
              const completion = readiness.sections[index]
              const percent = completion?.percent ?? 0
              const Icon = section.icon
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => goToSection(section.id)}
                    className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {section.title}
                    </span>
                    <Progress
                      value={percent}
                      className="hidden h-1 w-28 sm:block"
                      indicatorClassName={readinessBarClass(percent)}
                      aria-label={`${section.title} completion`}
                    />
                    <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {percent}%
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <div className="flex flex-col gap-6">
        <ReadinessPanel readiness={readiness} onSelectSection={goToSection} compact />

        <section className="rounded-card border border-border bg-surface-raised p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Project facts
          </h2>
          <dl className="mt-3 flex flex-col gap-3">
            <Fact label="Client" value={project.client || '—'} />
            <Fact label="Type" value={typeLabel(project.type)} />
            <Fact label="Start date" value={formatDate(project.startDate)} />
            <Fact label="Created" value={formatRelative(project.createdAt)} />
            <Fact label="Last updated" value={formatRelative(project.updatedAt)} />
          </dl>
        </section>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-card border border-border bg-surface-raised p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 truncate text-lg font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium">{value}</dd>
    </div>
  )
}
