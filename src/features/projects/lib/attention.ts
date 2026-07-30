import type { ProjectSummary } from '../hooks/use-projects'
import { daysUntil } from '@/lib/utils/date'

export interface AttentionItem {
  summary: ProjectSummary
  reason: string
  severity: 'critical' | 'warning'
}

/** Readiness below this is treated as "barely started" for a live project. */
const THIN_READINESS = 40
/** A brief this incomplete is a risk when the target date is close. */
const UNREADY_NEAR_DEADLINE = 80
const DEADLINE_WINDOW_DAYS = 14

/**
 * Which projects are drifting.
 *
 * The dashboard's job is to surface work that needs a decision, not to be a
 * second copy of the project list. Completed and archived projects are out of
 * scope by definition.
 */
export function projectsNeedingAttention(
  summaries: ProjectSummary[],
  limit = 5,
): AttentionItem[] {
  const items: AttentionItem[] = []

  for (const summary of summaries) {
    const { project, readiness, pageCount } = summary
    if (project.status === 'completed' || project.status === 'archived') continue

    const days = daysUntil(project.targetDate)

    if (days !== null && days < 0) {
      items.push({
        summary,
        severity: 'critical',
        reason: `Target date passed ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} ago · ${readiness.score}% ready`,
      })
      continue
    }

    if (days !== null && days <= DEADLINE_WINDOW_DAYS && readiness.score < UNREADY_NEAR_DEADLINE) {
      items.push({
        summary,
        severity: 'critical',
        reason: `Due ${days === 0 ? 'today' : `in ${days} ${days === 1 ? 'day' : 'days'}`} at only ${readiness.score}% ready`,
      })
      continue
    }

    if (project.status === 'active' && pageCount === 0) {
      items.push({
        summary,
        severity: 'warning',
        reason: 'Active with no pages defined yet',
      })
      continue
    }

    if (project.status === 'active' && readiness.score < THIN_READINESS) {
      const blocking = readiness.recommendations.filter(
        (recommendation) => recommendation.severity === 'critical',
      ).length
      items.push({
        summary,
        severity: 'warning',
        reason: blocking > 0
          ? `${readiness.score}% ready · ${blocking} ${blocking === 1 ? 'section is' : 'sections are'} missing required answers`
          : `${readiness.score}% ready`,
      })
    }
  }

  const order = { critical: 0, warning: 1 }
  return items
    .sort(
      (a, b) =>
        order[a.severity] - order[b.severity] ||
        a.summary.readiness.score - b.summary.readiness.score,
    )
    .slice(0, limit)
}

export interface PortfolioStats {
  total: number
  active: number
  pages: number
  averageReadiness: number
  needsAttention: number
}

export function portfolioStats(
  summaries: ProjectSummary[],
  attention: AttentionItem[],
): PortfolioStats {
  const live = summaries.filter(
    (summary) => summary.project.status !== 'archived' && summary.project.status !== 'completed',
  )

  return {
    total: summaries.length,
    active: summaries.filter((summary) => summary.project.status === 'active').length,
    pages: summaries.reduce((sum, summary) => sum + summary.pageCount, 0),
    // Averaged over live work only — archived projects would drag it down forever.
    averageReadiness:
      live.length === 0
        ? 0
        : Math.round(live.reduce((sum, summary) => sum + summary.readiness.score, 0) / live.length),
    needsAttention: attention.length,
  }
}
