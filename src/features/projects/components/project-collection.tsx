import { FolderSearch } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/stores/project-store'
import { ProjectCard } from './project-card'
import { ProjectRow } from './project-row'
import type { ProjectSummary } from '../hooks/use-projects'

/** One grid definition, so cards are identically sized on every surface. */
export const PROJECT_GRID_CLASS =
  'rs-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'

const COLUMNS = ['Project', 'Type', 'Status', 'Priority', 'Pages', 'Readiness', 'Target', 'Updated']

/** Renders a set of projects in the layout the user last chose. */
export function ProjectCollection({ summaries }: { summaries: ProjectSummary[] }) {
  const layout = useProjectStore((state) => state.layout)
  const clearFilters = useProjectStore((state) => state.clearFilters)

  if (summaries.length === 0) {
    return (
      <EmptyState
        icon={FolderSearch}
        title="No projects match your filters"
        description="Try a different search term, or clear the filters to see everything again."
        action={
          <Button variant="secondary" onClick={clearFilters}>
            Clear filters
          </Button>
        }
      />
    )
  }

  if (layout === 'list') {
    return (
      <div className="overflow-x-auto rounded-card border border-border bg-surface-raised">
        <table className="w-full min-w-3xl border-collapse text-left">
          <caption className="sr-only">Projects</caption>
          <thead>
            <tr className="border-b border-border bg-surface">
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => (
              <ProjectRow key={summary.project.id} summary={summary} />
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className={PROJECT_GRID_CLASS}>
      {summaries.map((summary, index) => (
        <div key={summary.project.id} style={{ animationDelay: `${Math.min(index, 8) * 25}ms` }}>
          <ProjectCard summary={summary} />
        </div>
      ))}
    </div>
  )
}
