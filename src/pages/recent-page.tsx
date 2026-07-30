import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { EmptyState } from '@/components/common/empty-state'
import { ProjectCollection } from '@/features/projects/components/project-collection'
import { ProjectToolbar } from '@/features/projects/components/project-toolbar'
import { useAllTags, useProjectSummaries } from '@/features/projects/hooks/use-projects'
import { filterProjects, recentProjects } from '@/features/projects/lib/filter-projects'
import { useProjectStore } from '@/stores/project-store'
import { pluralize } from '@/lib/utils/text'

const RECENT_LIMIT = 24

/** Projects in the order they were last opened. */
export function RecentPage() {
  const summaries = useProjectSummaries()
  const tags = useAllTags(summaries)
  const filters = useProjectStore()

  const visible = useMemo(() => {
    if (!summaries) return []
    // Recency is the sort here, so the toolbar's sort choice is not applied.
    return recentProjects(filterProjects(summaries, filters), RECENT_LIMIT)
  }, [summaries, filters])

  if (summaries === undefined) {
    return <div className="p-6 text-sm text-muted-foreground lg:p-8">Loading…</div>
  }

  const anyOpened = summaries.some((summary) => summary.project.lastOpenedAt)

  return (
    <div className="rs-scroll-area h-full overflow-y-auto flex flex-col gap-6 p-4 lg:p-8">
      <PageHeader
        title="Recent"
        description="Projects you have opened, most recent first."
      />

      {!anyOpened ? (
        <EmptyState
          icon={Clock}
          title="Nothing opened yet"
          description="Open a project and it will show up here for quick access."
        />
      ) : (
        <>
          <ProjectToolbar tags={tags} count={pluralize(visible.length, 'project')} />
          <ProjectCollection summaries={visible} />
        </>
      )}
    </div>
  )
}
