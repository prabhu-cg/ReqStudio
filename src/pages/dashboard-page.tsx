import { useMemo, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  FolderKanban,
  Gauge,
  Pin,
  Plus,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { EmptyState } from '@/components/common/empty-state'
import { LocalDataNotice } from '@/components/common/local-data-notice'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/primitives'
import { ProjectCard } from '@/features/projects/components/project-card'
import { PROJECT_GRID_CLASS } from '@/features/projects/components/project-collection'
import { useProjectSummaries } from '@/features/projects/hooks/use-projects'
import { portfolioStats, projectsNeedingAttention } from '@/features/projects/lib/attention'
import type { AttentionItem } from '@/features/projects/lib/attention'
import { STATUS_META, readinessBarClass } from '@/features/projects/lib/project-display'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { PROJECT_STATUSES, type ProjectStatus } from '@/types/project'
import { cn } from '@/lib/utils/cn'
import { pluralize } from '@/lib/utils/text'

/**
 * Portfolio overview.
 *
 * Deliberately not a project list — Projects is the browsing surface and Recent
 * is the last-opened list. This answers "what needs me today?" across every
 * project, and hands off to those pages rather than repeating them.
 */
export function DashboardPage() {
  const summaries = useProjectSummaries()
  const openDrawer = useUIStore((state) => state.openDrawer)

  const attention = useMemo(() => projectsNeedingAttention(summaries ?? []), [summaries])
  const stats = useMemo(() => portfolioStats(summaries ?? [], attention), [summaries, attention])
  const pinned = useMemo(
    () => (summaries ?? []).filter((summary) => summary.project.pinned),
    [summaries],
  )

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(
      PROJECT_STATUSES.map((status) => [status, 0]),
    ) as Record<ProjectStatus, number>
    for (const { project } of summaries ?? []) counts[project.status] += 1
    return counts
  }, [summaries])

  if (summaries === undefined) {
    return <div className="p-6 text-sm text-muted-foreground lg:p-8">Loading your projects…</div>
  }

  if (summaries.length === 0) {
    return (
      <div className="rs-scroll-area h-full overflow-y-auto">
        <div className="rs-page p-4 lg:p-8">
        <PageHeader
          title="Dashboard"
          description="ReqStudio keeps every brief on this device — free, offline and private."
        />
        <LocalDataNotice className="mt-6" />
        <div className="mt-6">
          <EmptyState
            icon={Sparkles}
            title="Create your first project"
            description="Set up a project, then work through ten brief sections in any order. Everything autosaves as you type."
            action={
              <Button variant="primary" size="lg" onClick={() => openDrawer({ type: 'project.create' })}>
                <Plus aria-hidden="true" />
                New project
              </Button>
            }
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rs-scroll-area h-full overflow-y-auto">
      <div className="rs-page flex flex-col gap-8 p-4 lg:p-8">
      <PageHeader
        title="Dashboard"
        description="Where your briefs stand today."
        actions={
          <Button variant="primary" onClick={() => openDrawer({ type: 'project.create' })}>
            <Plus aria-hidden="true" />
            New project
          </Button>
        }
      />

      <section aria-label="Portfolio summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={<FolderKanban className="size-4" aria-hidden="true" />}
          label="Projects"
          value={String(stats.total)}
          hint={`${pluralize(stats.active, 'active project')} · ${pluralize(stats.pages, 'page')}`}
        />
        <StatTile
          icon={<Gauge className="size-4" aria-hidden="true" />}
          label="Average readiness"
          value={`${stats.averageReadiness}%`}
          hint="Across live projects"
        >
          <Progress
            value={stats.averageReadiness}
            className="mt-3"
            indicatorClassName={readinessBarClass(stats.averageReadiness)}
            aria-label="Average readiness"
          />
        </StatTile>
        <StatTile
          icon={<TriangleAlert className="size-4" aria-hidden="true" />}
          label="Needs attention"
          value={String(stats.needsAttention)}
          hint={stats.needsAttention === 0 ? 'Everything on track' : 'Listed below'}
          tone={stats.needsAttention > 0 ? 'warning' : undefined}
        />
        <StatTile
          icon={<Pin className="size-4" aria-hidden="true" />}
          label="Pinned"
          value={String(pinned.length)}
          hint={pinned.length === 0 ? 'Pin a project to track it' : 'Kept close at hand'}
        />
      </section>

      {/* Always rendered, including when empty: a section that vanishes leaves
          "nothing to do" indistinguishable from "this feature is broken". */}
      <section aria-labelledby="attention-heading" className="flex flex-col gap-3">
        <h2 id="attention-heading" className="text-sm font-semibold tracking-tight">
          Needs attention
        </h2>
        {attention.length === 0 ? (
          <p className="flex items-center gap-2.5 rounded-card border border-border bg-surface-raised px-4 py-4 text-sm text-muted-foreground">
            <CircleCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
            Nothing is slipping. Overdue targets, deadlines approaching on a thin brief, and active
            projects with no pages will show up here.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {attention.map((item) => (
              <AttentionRow key={item.summary.project.id} item={item} />
            ))}
          </ul>
        )}
      </section>

      <StatusBreakdown counts={statusCounts} total={stats.total} />

      {pinned.length > 0 ? (
        <section aria-labelledby="pinned-heading" className="flex flex-col gap-3">
          <h2
            id="pinned-heading"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <Pin className="size-3.5 text-primary-text" aria-hidden="true" />
            Pinned
          </h2>
          <div className={PROJECT_GRID_CLASS}>
            {pinned.map((summary) => (
              <ProjectCard key={summary.project.id} summary={summary} />
            ))}
          </div>
        </section>
      ) : null}

      <LocalDataNotice />

      <div className="flex items-center justify-end border-t border-border pt-6">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/projects">
            Browse all {pluralize(stats.total, 'project')}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
      </div>
    </div>
  )
}

function StatTile({
  icon,
  label,
  value,
  hint,
  tone,
  children,
}: {
  icon: ReactNode
  label: string
  value: string
  hint: string
  tone?: 'warning'
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface-raised p-4',
        tone === 'warning' && 'border-warning/40',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 text-muted-foreground',
          tone === 'warning' && 'text-warning',
        )}
      >
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
      {children}
    </div>
  )
}

function AttentionRow({ item }: { item: AttentionItem }) {
  const { project, readiness } = item.summary
  const Icon = item.severity === 'critical' ? CircleAlert : TriangleAlert

  return (
    <li>
      <Link
        to={`/projects/${project.id}`}
        className="group flex items-center gap-3 rounded-card border border-border bg-surface-raised p-4 transition-colors hover:border-primary"
      >
        <Icon
          className={cn(
            'size-4 shrink-0',
            item.severity === 'critical' ? 'text-danger' : 'text-warning',
          )}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium group-hover:text-primary-text">
            {project.name || 'Untitled project'}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{item.reason}</span>
        </span>
        <Progress
          value={readiness.score}
          className="hidden w-24 shrink-0 sm:block"
          indicatorClassName={readinessBarClass(readiness.score)}
          aria-label={`${project.name} readiness`}
        />
        <ArrowRight
          className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </Link>
    </li>
  )
}

/** Counts by status that hand off to Projects with that filter already applied. */
function StatusBreakdown({
  counts,
  total,
}: {
  counts: Record<ProjectStatus, number>
  total: number
}) {
  const navigate = useNavigate()
  const clearFilters = useProjectStore((state) => state.clearFilters)
  const toggleStatus = useProjectStore((state) => state.toggleStatus)

  function openFiltered(status: ProjectStatus) {
    clearFilters()
    toggleStatus(status)
    navigate('/projects')
  }

  return (
    <section aria-labelledby="status-heading" className="flex flex-col gap-3">
      <h2 id="status-heading" className="text-sm font-semibold tracking-tight">
        By status
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PROJECT_STATUSES.map((status) => {
          const count = counts[status]
          const share = total === 0 ? 0 : Math.round((count / total) * 100)
          return (
            <button
              key={status}
              type="button"
              onClick={() => openFiltered(status)}
              disabled={count === 0}
              className="rounded-card border border-border bg-surface-raised p-4 text-left transition-colors hover:border-primary disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {STATUS_META[status].label}
                </span>
                <span className="text-sm font-semibold tabular-nums">{count}</span>
              </span>
              <span className="mt-2 block h-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${share}%` }}
                />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
