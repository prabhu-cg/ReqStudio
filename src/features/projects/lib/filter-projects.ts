import type { ProjectSummary } from '../hooks/use-projects'
import type { ProjectViewState, ProjectSort } from '@/stores/project-store'
import { matchesQuery } from '@/lib/utils/text'

type Filters = Pick<ProjectViewState, 'search' | 'statuses' | 'types' | 'priorities' | 'tags'>

/** Search across every field a user might remember a project by. */
function matchesSearch(summary: ProjectSummary, search: string): boolean {
  const { project } = summary
  return matchesQuery(
    search,
    project.name,
    project.client,
    project.description,
    project.designer,
    project.type,
    project.status,
    project.tags.join(' '),
    project.stakeholders.join(' '),
    summary.pages.map((page) => page.name).join(' '),
  )
}

export function filterProjects(
  summaries: ProjectSummary[],
  filters: Filters,
): ProjectSummary[] {
  return summaries.filter((summary) => {
    const { project } = summary
    if (!matchesSearch(summary, filters.search)) return false
    if (filters.statuses.length > 0 && !filters.statuses.includes(project.status)) return false
    if (filters.types.length > 0 && !filters.types.includes(project.type)) return false
    if (filters.priorities.length > 0 && !filters.priorities.includes(project.priority)) return false
    if (filters.tags.length > 0 && !filters.tags.some((tag) => project.tags.includes(tag))) {
      return false
    }
    return true
  })
}

const comparators: Record<ProjectSort, (a: ProjectSummary, b: ProjectSummary) => number> = {
  'updated-desc': (a, b) => b.project.updatedAt.localeCompare(a.project.updatedAt),
  'updated-asc': (a, b) => a.project.updatedAt.localeCompare(b.project.updatedAt),
  'created-desc': (a, b) => b.project.createdAt.localeCompare(a.project.createdAt),
  'name-asc': (a, b) => a.project.name.localeCompare(b.project.name),
  'name-desc': (a, b) => b.project.name.localeCompare(a.project.name),
  'readiness-desc': (a, b) => b.readiness.score - a.readiness.score,
  'readiness-asc': (a, b) => a.readiness.score - b.readiness.score,
  'target-asc': (a, b) => {
    // Projects without a target date sort last.
    if (!a.project.targetDate) return b.project.targetDate ? 1 : 0
    if (!b.project.targetDate) return -1
    return a.project.targetDate.localeCompare(b.project.targetDate)
  },
}

/** Sorts, always floating pinned projects to the top. */
export function sortProjects(summaries: ProjectSummary[], sort: ProjectSort): ProjectSummary[] {
  const comparator = comparators[sort]
  return [...summaries].sort((a, b) => {
    if (a.project.pinned !== b.project.pinned) return a.project.pinned ? -1 : 1
    return comparator(a, b)
  })
}

export function recentProjects(summaries: ProjectSummary[], limit = 24): ProjectSummary[] {
  return [...summaries]
    .filter((summary) => summary.project.lastOpenedAt)
    .sort((a, b) => (b.project.lastOpenedAt ?? '').localeCompare(a.project.lastOpenedAt ?? ''))
    .slice(0, limit)
}
