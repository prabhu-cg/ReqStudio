import {
  FilePlus2,
  FileMinus2,
  FolderPlus,
  History,
  PencilLine,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { useProjectActivity } from '@/features/projects/hooks/use-projects'
import { useWorkspace } from '../workspace-context'
import { formatDateTime, formatRelative } from '@/lib/utils/date'
import type { ActivityType } from '@/types/project'

const ICONS: Record<ActivityType, LucideIcon> = {
  'project.created': FolderPlus,
  'project.updated': PencilLine,
  'project.status-changed': RefreshCw,
  'project.deleted': FileMinus2,
  'brief.updated': PencilLine,
  'page.created': FilePlus2,
  'page.updated': PencilLine,
  'page.deleted': FileMinus2,
}

export function ActivityTab() {
  const { project } = useWorkspace()
  const events = useProjectActivity(project.id)

  if (events.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No activity yet"
        description="Changes to this project's details, brief sections and pages are recorded here."
      />
    )
  }

  return (
    <section aria-label="Project activity" className="max-w-3xl">
      <ol className="relative flex flex-col">
        {events.map((event, index) => {
          const Icon = ICONS[event.type] ?? PencilLine
          const isLast = index === events.length - 1

          return (
            <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast ? (
                <span
                  className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-border"
                  aria-hidden="true"
                />
              ) : null}

              <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full border border-border bg-surface-raised text-muted-foreground">
                <Icon className="size-3.5" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm font-medium">{event.summary}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <time dateTime={event.createdAt} title={formatDateTime(event.createdAt)}>
                    {formatRelative(event.createdAt)}
                  </time>
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
