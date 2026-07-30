import type { ReactNode } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Check, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { selectActiveFilterCount, useProjectStore } from '@/stores/project-store'
import { PRIORITY_META, STATUS_META, TYPE_META } from '../lib/project-display'
import type { ProjectPriority, ProjectStatus, ProjectType } from '@/types/project'
import { cn } from '@/lib/utils/cn'

/**
 * Filters as a single panel rather than a dropdown menu.
 *
 * A menu of forty checkboxes runs off the bottom of the viewport; a fixed-width
 * multi-column panel shows every option at once and stays inside the collision
 * boundary. Radix keeps it flipping and shifting to fit.
 */
export function ProjectFilterPanel({ tags }: { tags: string[] }) {
  const store = useProjectStore()
  const activeFilters = useProjectStore(selectActiveFilterCount)

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="secondary" size="md">
          <SlidersHorizontal aria-hidden="true" />
          Filter
          {activeFilters > 0 ? (
            <span className="ml-0.5 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {activeFilters}
            </span>
          ) : null}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          collisionPadding={16}
          className="z-90 flex w-[min(38rem,calc(100vw-2rem))] max-h-[var(--radix-popover-content-available-height)] flex-col overflow-hidden rounded-card border border-border bg-surface-raised shadow-raised data-[state=open]:animate-[fade-in_120ms_ease-out]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Filter projects</h2>
            {activeFilters > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => store.clearFilters()}>
                <X aria-hidden="true" />
                Clear {activeFilters}
              </Button>
            ) : null}
          </div>

          <div className="rs-scroll-area grid grid-cols-1 gap-x-8 gap-y-6 overflow-y-auto p-4 sm:grid-cols-2">
            <FilterGroup label="Status">
              {(Object.keys(STATUS_META) as ProjectStatus[]).map((status) => (
                <FilterChip
                  key={status}
                  label={STATUS_META[status].label}
                  checked={store.statuses.includes(status)}
                  onToggle={() => store.toggleStatus(status)}
                />
              ))}
            </FilterGroup>

            <FilterGroup label="Priority">
              {(Object.keys(PRIORITY_META) as ProjectPriority[]).map((priority) => (
                <FilterChip
                  key={priority}
                  label={PRIORITY_META[priority].label}
                  checked={store.priorities.includes(priority)}
                  onToggle={() => store.togglePriority(priority)}
                />
              ))}
            </FilterGroup>

            <FilterGroup label="Project type" className="sm:col-span-2">
              {(Object.keys(TYPE_META) as ProjectType[]).map((type) => (
                <FilterChip
                  key={type}
                  label={TYPE_META[type].label}
                  checked={store.types.includes(type)}
                  onToggle={() => store.toggleType(type)}
                />
              ))}
            </FilterGroup>

            {tags.length > 0 ? (
              <FilterGroup label="Tags" className="sm:col-span-2">
                {tags.map((tag) => (
                  <FilterChip
                    key={tag}
                    label={tag}
                    checked={store.tags.includes(tag)}
                    onToggle={() => store.toggleTag(tag)}
                  />
                ))}
              </FilterGroup>
            ) : null}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function FilterGroup({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  )
}

function FilterChip({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
        checked
          ? 'border-primary bg-primary-soft text-primary-text'
          : 'border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground',
      )}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={onToggle} />
      {checked ? <Check className="size-3.5" aria-hidden="true" /> : null}
      {label}
    </label>
  )
}
