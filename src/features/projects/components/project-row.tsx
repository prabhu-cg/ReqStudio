import { Link } from 'react-router-dom'
import { Pin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/primitives'
import { PRIORITY_META, STATUS_META, readinessBarClass, typeLabel } from '../lib/project-display'
import { formatDate, formatRelative } from '@/lib/utils/date'
import type { ProjectSummary } from '../hooks/use-projects'

/** Compact list layout — the alternative to the card grid. */
export function ProjectRow({ summary }: { summary: ProjectSummary }) {
  const { project, pageCount, readiness } = summary

  return (
    <tr className="group border-b border-border last:border-b-0 hover:bg-muted/40">
      <td className="max-w-0 px-4 py-3">
        <div className="flex items-center gap-2">
          {project.pinned ? (
            <Pin className="size-3.5 shrink-0 text-primary-text" aria-label="Pinned" />
          ) : null}
          <Link
            to={`/projects/${project.id}`}
            className="truncate text-sm font-medium hover:text-primary-text"
          >
            {project.name || 'Untitled project'}
          </Link>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {project.client || 'No client'}
        </p>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
        {typeLabel(project.type)}
      </td>
      <td className="px-4 py-3">
        <Badge tone={STATUS_META[project.status].tone}>{STATUS_META[project.status].label}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge tone={PRIORITY_META[project.priority].tone}>
          {PRIORITY_META[project.priority].label}
        </Badge>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-muted-foreground">
        {pageCount}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Progress
            value={readiness.score}
            className="w-20"
            indicatorClassName={readinessBarClass(readiness.score)}
            aria-label={`${project.name} readiness`}
          />
          <span className="text-xs tabular-nums text-muted-foreground">{readiness.score}%</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
        {formatDate(project.targetDate)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
        {formatRelative(project.updatedAt)}
      </td>
    </tr>
  )
}
