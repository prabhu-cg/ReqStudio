import type { ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Copy,
  FileStack,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/primitives'
import { EmptyState } from '@/components/common/empty-state'
import { useUIStore } from '@/stores/ui-store'
import { duplicatePage, movePage } from '../services/page-service'
import { pageCompletion, pageMissingFields } from '../lib/page-completion'
import { readinessBarClass } from '@/features/projects/lib/project-display'
import type { SectionPaneProps } from '@/types/section'
import type { ProjectPage } from '@/types/project'
import { cn } from '@/lib/utils/cn'
import { truncate } from '@/lib/utils/text'

/** Custom pane for section 5 — pages live in their own table, not in the brief blob. */
export function PageRequirementsPane({ project, pages }: SectionPaneProps) {
  const openDrawer = useUIStore((state) => state.openDrawer)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {pages.length === 0
            ? 'No pages yet.'
            : `${pages.length} ${pages.length === 1 ? 'page' : 'pages'} defined.`}
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => openDrawer({ type: 'page.create', projectId: project.id })}
        >
          <Plus aria-hidden="true" />
          Add page
        </Button>
      </div>

      {pages.length === 0 ? (
        <EmptyState
          icon={FileStack}
          size="sm"
          title="Start with your key pages"
          description="Add every page in the build — home, product, pricing, contact — then fill in the detail as it firms up."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openDrawer({ type: 'page.create', projectId: project.id })}
            >
              <Plus aria-hidden="true" />
              Add the first page
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {pages.map((page, index) => (
            <PageRow
              key={page.id}
              page={page}
              index={index}
              total={pages.length}
              projectId={project.id}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function PageRow({
  page,
  index,
  total,
  projectId,
}: {
  page: ProjectPage
  index: number
  total: number
  projectId: string
}) {
  const openDrawer = useUIStore((state) => state.openDrawer)
  const completion = pageCompletion(page)
  const missing = pageMissingFields(page)

  return (
    <li>
      <div className="group flex items-start gap-4 rounded-card border border-border bg-surface-raised p-4 transition-colors hover:border-border-strong">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[6px] bg-muted text-xs font-semibold text-muted-foreground">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openDrawer({ type: 'page.edit', projectId, pageId: page.id })}
              className="truncate rounded text-sm font-semibold hover:text-primary-text"
            >
              {page.name || 'Untitled page'}
            </button>
            {page.primaryCta ? (
              <Badge tone="outline">CTA: {truncate(page.primaryCta, 28)}</Badge>
            ) : null}
          </div>

          <p
            className={cn(
              'mt-1 text-sm leading-relaxed',
              page.purpose ? 'text-muted-foreground' : 'italic text-muted-foreground/70',
            )}
          >
            {page.purpose ? truncate(page.purpose, 160) : 'No purpose recorded yet'}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Progress
              value={completion}
              className="h-1 w-40"
              indicatorClassName={readinessBarClass(completion)}
              aria-label={`${page.name || 'Untitled page'} completion`}
            />
            <span
              className={cn(
                'text-xs font-medium tabular-nums',
                completion >= 80 ? 'text-success' : 'text-muted-foreground',
              )}
            >
              {completion}%
            </span>
            {missing.length > 0 ? (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Missing: {missing.slice(0, 2).join(', ')}
                {missing.length > 2 ? ` +${missing.length - 2}` : ''}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openDrawer({ type: 'page.edit', projectId, pageId: page.id })}
            aria-label={`Edit ${page.name || 'untitled page'}`}
          >
            <Pencil aria-hidden="true" />
          </Button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${page.name || 'untitled page'}`}
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="z-90 min-w-48 rounded-[10px] border border-border bg-surface-raised p-1 shadow-raised data-[state=open]:animate-[fade-in_120ms_ease-out]"
              >
                <MenuItem
                  disabled={index === 0}
                  onSelect={() => void movePage(page, -1)}
                  icon={<ArrowUp className="size-4" aria-hidden="true" />}
                >
                  Move up
                </MenuItem>
                <MenuItem
                  disabled={index === total - 1}
                  onSelect={() => void movePage(page, 1)}
                  icon={<ArrowDown className="size-4" aria-hidden="true" />}
                >
                  Move down
                </MenuItem>
                <MenuItem
                  onSelect={() => void duplicatePage(page.id)}
                  icon={<Copy className="size-4" aria-hidden="true" />}
                >
                  Duplicate
                </MenuItem>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <MenuItem
                  danger
                  onSelect={() => openDrawer({ type: 'page.delete', projectId, pageId: page.id })}
                  icon={<Trash2 className="size-4" aria-hidden="true" />}
                >
                  Delete page
                </MenuItem>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </li>
  )
}

function MenuItem({
  children,
  icon,
  onSelect,
  disabled,
  danger,
}: {
  children: ReactNode
  icon: ReactNode
  onSelect: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        'flex cursor-default items-center gap-2 rounded-[6px] px-2.5 py-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-muted',
        danger && 'text-danger',
      )}
    >
      {icon}
      {children}
    </DropdownMenu.Item>
  )
}
