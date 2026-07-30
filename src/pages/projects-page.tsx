import { useMemo } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { ProjectCollection } from '@/features/projects/components/project-collection'
import { ProjectToolbar } from '@/features/projects/components/project-toolbar'
import { useAllTags, useProjectSummaries } from '@/features/projects/hooks/use-projects'
import { filterProjects, sortProjects } from '@/features/projects/lib/filter-projects'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { pluralize } from '@/lib/utils/text'

export function ProjectsPage() {
  const summaries = useProjectSummaries()
  const tags = useAllTags(summaries)
  const filters = useProjectStore()
  const openDrawer = useUIStore((state) => state.openDrawer)

  const visible = useMemo(() => {
    if (!summaries) return []
    return sortProjects(filterProjects(summaries, filters), filters.sort)
  }, [summaries, filters])

  if (summaries === undefined) {
    return <div className="p-6 text-sm text-muted-foreground lg:p-8">Loading projects…</div>
  }

  return (
    <div className="rs-scroll-area h-full overflow-y-auto flex flex-col gap-6 p-4 lg:p-8">
      <PageHeader
        title="Projects"
        description={
          summaries.length === 0
            ? 'No projects yet.'
            : 'Unlimited projects, stored locally on this device.'
        }
        actions={
          <Button variant="primary" onClick={() => openDrawer({ type: 'project.create' })}>
            <Plus aria-hidden="true" />
            New project
          </Button>
        }
      />

      {summaries.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No projects yet"
          description="Create a project to start a requirements brief. There is no limit and no account needed."
          action={
            <Button variant="primary" onClick={() => openDrawer({ type: 'project.create' })}>
              <Plus aria-hidden="true" />
              New project
            </Button>
          }
        />
      ) : (
        <>
          <ProjectToolbar
            tags={tags}
            count={
              visible.length === summaries.length
                ? pluralize(summaries.length, 'project')
                : `${visible.length} of ${summaries.length} projects`
            }
          />
          <ProjectCollection summaries={visible} />
        </>
      )}
    </div>
  )
}
