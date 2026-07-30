import type { ReactNode } from 'react'
import { CalendarDays, Pencil, User, Users } from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/primitives'
import { useProject, useProjectPages, useProjectReadiness } from '../hooks/use-projects'
import { PRIORITY_META, STATUS_META, readinessBarClass, typeLabel } from '../lib/project-display'
import { formatDate, formatRelative } from '@/lib/utils/date'
import { useUIStore } from '@/stores/ui-store'
import type { DrawerComponentProps } from '@/components/drawers/drawer-registry'
import { pluralize } from '@/lib/utils/text'

export function ProjectDetailsDrawer({
  state,
  open,
  onClose,
}: DrawerComponentProps<'project.details'>) {
  const project = useProject(state.projectId)
  const pages = useProjectPages(state.projectId)
  const readiness = useProjectReadiness(project, pages)
  const openDrawer = useUIStore((store) => store.openDrawer)

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={project?.name ?? 'Project'}
      description={project?.client || undefined}
      size="md"
      headerAccessory={
        project ? (
          <Badge tone={STATUS_META[project.status].tone} size="md">
            {STATUS_META[project.status].label}
          </Badge>
        ) : null
      }
      footer={
        <Button
          variant="secondary"
          onClick={() => openDrawer({ type: 'project.edit', projectId: state.projectId })}
        >
          <Pencil aria-hidden="true" />
          Edit project
        </Button>
      }
    >
      {!project ? (
        <p className="text-sm text-muted-foreground">This project is no longer available.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Readiness
              </h3>
              <span className="text-sm font-semibold">{readiness?.score ?? 0}%</span>
            </div>
            <Progress
              value={readiness?.score ?? 0}
              indicatorClassName={readinessBarClass(readiness?.score ?? 0)}
              aria-label="Project readiness"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {readiness && readiness.missingSections.length > 0
                ? `${readiness.missingSections.length} of 10 sections still need work.`
                : 'Every section is complete.'}
            </p>
          </section>

          {project.description ? (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Description
              </h3>
              <p className="text-sm leading-relaxed">{project.description}</p>
            </section>
          ) : null}

          <dl className="grid grid-cols-2 gap-4">
            <DetailItem label="Type" value={typeLabel(project.type)} />
            <DetailItem label="Priority" value={PRIORITY_META[project.priority].label} />
            <DetailItem label="Pages" value={pluralize(pages.length, 'page')} />
            <DetailItem label="Last updated" value={formatRelative(project.updatedAt)} />
            <DetailItem
              label="Start date"
              value={formatDate(project.startDate)}
              icon={<CalendarDays className="size-3.5" aria-hidden="true" />}
            />
            <DetailItem
              label="Target date"
              value={formatDate(project.targetDate)}
              icon={<CalendarDays className="size-3.5" aria-hidden="true" />}
            />
            <DetailItem
              label="Lead designer"
              value={project.designer || '—'}
              icon={<User className="size-3.5" aria-hidden="true" />}
            />
            <DetailItem
              label="Stakeholders"
              value={project.stakeholders.length > 0 ? project.stakeholders.join(', ') : '—'}
              icon={<Users className="size-3.5" aria-hidden="true" />}
            />
          </dl>

          {project.tags.length > 0 ? (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge key={tag} tone="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </Drawer>
  )
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
        {icon}
        <span className="truncate">{value}</span>
      </dd>
    </div>
  )
}
