import { CircleAlert, Info, Lightbulb, TriangleAlert } from 'lucide-react'
import { Progress } from '@/components/ui/primitives'
import { cn } from '@/lib/utils/cn'
import { readinessBarClass } from '@/features/projects/lib/project-display'
import type { ReadinessReport, Recommendation } from '@/types/section'

const SEVERITY = {
  critical: { icon: CircleAlert, className: 'text-danger' },
  warning: { icon: TriangleAlert, className: 'text-warning' },
  suggestion: { icon: Lightbulb, className: 'text-info' },
}

export interface ReadinessPanelProps {
  readiness: ReadinessReport
  onSelectSection?: (sectionId: string) => void
  className?: string
  compact?: boolean
}

/** Score, missing sections and prioritised recommendations. */
export function ReadinessPanel({
  readiness,
  onSelectSection,
  className,
  compact = false,
}: ReadinessPanelProps) {
  const recommendations = compact
    ? readiness.recommendations.slice(0, 3)
    : readiness.recommendations

  return (
    <section
      aria-label="Project readiness"
      className={cn('rounded-card border border-border bg-surface-raised p-5', className)}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Readiness score
          </h2>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums tracking-tight">{readiness.score}%</span>
            <span className="text-xs text-muted-foreground">
              {readiness.score >= 100
                ? 'Ready to share'
                : `${readiness.missingSections.length} of ${readiness.sections.length} sections open`}
            </span>
          </p>
        </div>
      </div>

      <Progress
        value={readiness.score}
        className="mt-4"
        indicatorClassName={readinessBarClass(readiness.score)}
        aria-label={`Readiness ${readiness.score} percent`}
      />

      {readiness.missingSections.length > 0 ? (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Missing
          </h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {readiness.missingSections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => onSelectSection?.(section.id)}
                  disabled={!onSelectSection}
                  className={cn(
                    'rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground transition-colors',
                    onSelectSection && 'hover:border-primary hover:text-primary-text',
                  )}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Recommendations
        </h3>
        {recommendations.length === 0 ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="size-4 shrink-0" aria-hidden="true" />
            Nothing outstanding — this brief is in good shape.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {recommendations.map((recommendation) => (
              <RecommendationRow
                key={recommendation.id}
                recommendation={recommendation}
                onSelectSection={onSelectSection}
              />
            ))}
          </ul>
        )}
        {compact && readiness.recommendations.length > recommendations.length ? (
          <p className="mt-2 text-xs text-muted-foreground">
            +{readiness.recommendations.length - recommendations.length} more in the Brief tab
          </p>
        ) : null}
      </div>
    </section>
  )
}

function RecommendationRow({
  recommendation,
  onSelectSection,
}: {
  recommendation: Recommendation
  onSelectSection?: (sectionId: string) => void
}) {
  const { icon: Icon, className } = SEVERITY[recommendation.severity]
  const clickable = Boolean(recommendation.sectionId && onSelectSection)

  const content = (
    <>
      <Icon className={cn('mt-0.5 size-4 shrink-0', className)} aria-hidden="true" />
      <span className="text-sm leading-relaxed">{recommendation.message}</span>
    </>
  )

  return (
    <li>
      {clickable ? (
        <button
          type="button"
          onClick={() => onSelectSection?.(recommendation.sectionId!)}
          className="flex w-full items-start gap-2 rounded-[8px] px-2 py-1.5 text-left transition-colors hover:bg-muted"
        >
          {content}
        </button>
      ) : (
        <div className="flex items-start gap-2 px-2 py-1.5">{content}</div>
      )}
    </li>
  )
}
