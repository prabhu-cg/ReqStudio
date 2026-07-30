import { useCallback, useEffect } from 'react'
import { NavLink, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import { FolderX, MoreHorizontal, Pencil, Pin, PinOff, Settings2, Trash2 } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/empty-state'
import { useProject, useProjectPages, useProjectReadiness } from '@/features/projects/hooks/use-projects'
import { openProject, togglePinned } from '@/features/projects/services/project-service'
import { STATUS_META, readinessBarClass, typeLabel } from '@/features/projects/lib/project-display'
import { useUIStore } from '@/stores/ui-store'
import { workspaceTabs } from './workspace-tabs'
import type { WorkspaceContext } from './workspace-context'
import { Progress } from '@/components/ui/primitives'
import { cn } from '@/lib/utils/cn'
import { formatRelative } from '@/lib/utils/date'
import { pluralize } from '@/lib/utils/text'
import { useHeightVariable } from '@/lib/hooks/use-height-variable'

export function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>()
  const project = useProject(projectId)
  const pages = useProjectPages(projectId)
  const readiness = useProjectReadiness(project, pages)
  const navigate = useNavigate()
  const openDrawer = useUIStore((state) => state.openDrawer)

  useEffect(() => {
    if (projectId && project) void openProject(projectId)
  }, [projectId, project])

  // Exposes the scrollport height to sticky panels inside the active tab.
  const tabViewportRef = useHeightVariable('--rs-tab-h')

  const goToSection = useCallback(
    (sectionId: string) => {
      navigate(`/projects/${projectId}/brief?section=${encodeURIComponent(sectionId)}`)
    },
    [navigate, projectId],
  )

  // `undefined` while the live query resolves; `null` when it does not exist.
  if (project === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Loading project…</div>
  }

  if (!project || !readiness) {
    return (
      <div className="h-full overflow-y-auto p-6 lg:p-8">
        <EmptyState
          icon={FolderX}
          title="Project not found"
          description="It may have been deleted, or this link belongs to a different device."
          action={
            <Button variant="primary" onClick={() => navigate('/projects')}>
              Back to projects
            </Button>
          }
        />
      </div>
    )
  }

  const context: WorkspaceContext = { project, pages, readiness, goToSection }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border bg-surface px-4 pt-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight">{project.name}</h1>
              <Badge tone={STATUS_META[project.status].tone} size="md">
                {STATUS_META[project.status].label}
              </Badge>
              {project.pinned ? (
                <Badge tone="outline">
                  <Pin aria-hidden="true" />
                  Pinned
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {[
                project.client || 'No client',
                typeLabel(project.type),
                pluralize(pages.length, 'page'),
                `Updated ${formatRelative(project.updatedAt)}`,
              ].join(' · ')}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="w-28">
                <Progress
                  value={readiness.score}
                  indicatorClassName={readinessBarClass(readiness.score)}
                  aria-label="Readiness score"
                />
              </div>
              <span className="text-sm font-semibold tabular-nums">{readiness.score}%</span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => openDrawer({ type: 'project.edit', projectId: project.id })}
            >
              <Pencil aria-hidden="true" />
              Edit
            </Button>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Project actions">
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
                    onSelect={() => openDrawer({ type: 'project.details', projectId: project.id })}
                    className="flex cursor-default items-center gap-2 rounded-[6px] px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-muted"
                  >
                    <Settings2 className="size-4" aria-hidden="true" />
                    View details
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => void togglePinned(project.id)}
                    className="flex cursor-default items-center gap-2 rounded-[6px] px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-muted"
                  >
                    {project.pinned ? (
                      <PinOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Pin className="size-4" aria-hidden="true" />
                    )}
                    {project.pinned ? 'Unpin' : 'Pin to dashboard'}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => openDrawer({ type: 'project.settings', projectId: project.id })}
                    className="flex cursor-default items-center gap-2 rounded-[6px] px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-muted"
                  >
                    <Settings2 className="size-4" aria-hidden="true" />
                    Project settings
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                  <DropdownMenu.Item
                    onSelect={() => openDrawer({ type: 'project.delete', projectId: project.id })}
                    className="flex cursor-default items-center gap-2 rounded-[6px] px-2.5 py-2 text-sm text-danger outline-none data-[highlighted]:bg-muted"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete project
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        <nav aria-label="Workspace sections" className="mt-6 flex gap-1 overflow-x-auto">
          {workspaceTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                end={tab.index}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-t-[8px] border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary text-primary-text'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                {tab.label}
              </NavLink>
            )
          })}
        </nav>
      </header>

      <div
        ref={tabViewportRef}
        className="rs-scroll-area min-h-0 flex-1 overflow-y-auto p-4 lg:p-8"
      >
        <Outlet context={context} />
      </div>
    </div>
  )
}

/** Redirects `/projects/:id` to the default tab. */
export function WorkspaceIndexRedirect() {
  const indexTab = workspaceTabs.find((tab) => tab.index) ?? workspaceTabs[0]!
  return <Navigate to={indexTab.path} replace />
}
