import type { DocumentStatistics } from '@/types/document'
import { Progress } from '@/components/ui/primitives'
import { readinessBarClass } from '@/features/projects/lib/project-display'
import { formatDateTime } from '@/lib/utils/date'

/**
 * Document statistics.
 *
 * Everything here is measured from the compiled document rather than the raw
 * brief, so the numbers describe what will actually be exported.
 */
export function DocumentStatisticsPanel({
  statistics,
  lastGeneratedAt,
}: {
  statistics: DocumentStatistics
  lastGeneratedAt: string | null
}) {
  const stats: Array<{ label: string; value: string }> = [
    { label: 'Sections', value: String(statistics.sections) },
    { label: 'With content', value: `${statistics.completedSections} of ${statistics.sections}` },
    { label: 'Estimated pages', value: String(statistics.pages) },
    { label: 'Project pages', value: String(statistics.projectPages) },
    { label: 'Words', value: statistics.words.toLocaleString() },
    { label: 'Characters', value: statistics.characters.toLocaleString() },
    { label: 'Tables', value: String(statistics.tables) },
    { label: 'Last generated', value: lastGeneratedAt ? formatDateTime(lastGeneratedAt) : 'Never' },
  ]

  return (
    <section
      aria-labelledby="document-statistics"
      className="rounded-card border border-border bg-surface-raised p-5 shadow-card"
    >
      <h2 id="document-statistics" className="text-sm font-semibold tracking-tight">
        Document statistics
      </h2>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Brief completeness
          </span>
          <span className="text-sm font-semibold tabular-nums">{statistics.completion}%</span>
        </div>
        <Progress
          value={statistics.completion}
          indicatorClassName={readinessBarClass(statistics.completion)}
          aria-label="Brief completeness"
          className="mt-2"
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="mt-1 truncate text-sm font-semibold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
