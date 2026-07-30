import { Link } from 'react-router-dom'
import {
  CalendarClock,
  FileStack,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Settings2,
  Trash2,
  User,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/primitives'
import { useUIStore } from '@/stores/ui-store'
import { togglePinned } from '../services/project-service'
import { PRIORITY_META, STATUS_META, readinessBarClass, typeLabel } from '../lib/project-display'
import { formatDate, formatRelative, daysUntil } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { truncate } from '@/lib/utils/text'
import type { ProjectSummary } from '../hooks/use-projects'

export function ProjectCard({ summary }: { summary: ProjectSummary }) {
  const { project, pageCount, readiness } = summary
  const days = daysUntil(project.targetDate)
  const overdue = days !== null && days < 0 && project.status !== 'completed'

  return (
    <article className="group relative flex flex-col rounded-card border border-border bg-surface-raised p-5 shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-raised">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_META[project.status].tone}>{STATUS_META[project.status].label}</Badge>
            {project.pinned ? (
              <Pin className="size-3.5 text-primary-text" aria-label="Pinned project" />
            ) : null}
          </div>

          <h3 className="mt-2 truncate text-base font-semibold tracking-tight">
            {/* Stretched link keeps the whole card clickable without nesting buttons. */}
            <Link
              to={`/projects/${project.id}`}
              className="after:absolute after:inset-0 after:content-[''] hover:text-primary-text"
            >
              {project.name || 'Untitled project'}
            </Link>
          </h3>

          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {project.client || 'No client'} · {typeLabel(project.type)}
          </p>
        </div>

        <ProjectCardMenu projectId={project.id} pinned={project.pinned} />
      </div>

      {project.description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {truncate(project.description, 120)}
        </p>
      ) : null}

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-muted-foreground">Readiness</span>
          <span className="text-xs font-semibold tabular-nums">{readiness.score}%</span>
        </div>
        <Progress
          value={readiness.score}
          className="mt-1.5"
          indicatorClassName={readinessBarClass(readiness.score)}
          aria-label={`${project.name} readiness ${readiness.score} percent`}
        />
      </div>

      <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Pages</dt>
          <FileStack className="size-3.5" aria-hidden="true" />
          <dd>{pageCount}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Priority</dt>
          <dd>
            <Badge tone={PRIORITY_META[project.priority].tone}>
              {PRIORITY_META[project.priority].label}
            </Badge>
          </dd>
        </div>
        {project.designer ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <dt className="sr-only">Lead designer</dt>
            <User className="size-3.5 shrink-0" aria-hidden="true" />
            <dd className="truncate">{project.designer}</dd>
          </div>
        ) : null}
        {project.targetDate ? (
          <div className={cn('flex items-center gap-1.5', overdue && 'text-danger')}>
            <dt className="sr-only">Target date</dt>
            <CalendarClock className="size-3.5" aria-hidden="true" />
            <dd>{formatDate(project.targetDate)}</dd>
          </div>
        ) : null}
      </dl>

      {project.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} tone="outline">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 3 ? (
            <Badge tone="outline">+{project.tags.length - 3}</Badge>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
        Updated {formatRelative(project.updatedAt)}
      </p>
    </article>
  )
}

function ProjectCardMenu({ projectId, pinned }: { projectId: string; pinned: boolean }) {
  const openDrawer = useUIStore((state) => state.openDrawer)

  const itemClass =
    'flex cursor-default items-center gap-2 rounded-[6px] px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-muted'

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          // Sits above the card's stretched link.
          className="relative z-10 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          aria-label="Project actions"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-90 min-w-52 rounded-[10px] border border-border bg-surface-raised p-1 shadow-raised"
        >
          <DropdownMenu.Item
            className={itemClass}
            onSelect={() => openDrawer({ type: 'project.details', projectId })}
          >
            <Settings2 className="size-4" aria-hidden="true" />
            View details
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={itemClass}
            onSelect={() => openDrawer({ type: 'project.edit', projectId })}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Edit project
          </DropdownMenu.Item>
          <DropdownMenu.Item className={itemClass} onSelect={() => void togglePinned(projectId)}>
            {pinned ? <PinOff className="size-4" aria-hidden="true" /> : <Pin className="size-4" aria-hidden="true" />}
            {pinned ? 'Unpin' : 'Pin to dashboard'}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            className={cn(itemClass, 'text-danger')}
            onSelect={() => openDrawer({ type: 'project.delete', projectId })}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete project
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
