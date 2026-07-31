import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ArrowUpDown, LayoutGrid, List, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  PROJECT_SORTS,
  PROJECT_SORT_LABELS,
  selectActiveFilterCount,
  useProjectStore,
  type ProjectSort,
} from '@/stores/project-store'
import { PRIORITY_META, STATUS_META, TYPE_META } from '../lib/project-display'
import { ProjectFilterPanel } from './project-filter-panel'
import { cn } from '@/lib/utils/cn'

/**
 * Filter / sort / layout controls.
 *
 * There is deliberately no search field here — the top bar owns search, and on
 * this route it filters the collection directly.
 */
export function ProjectToolbar({ tags, count }: { tags: string[]; count?: string }) {
  const store = useProjectStore()
  const activeFilters = useProjectStore(selectActiveFilterCount)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {count ? (
          <span className="mr-auto text-sm text-muted-foreground">{count}</span>
        ) : (
          <span className="mr-auto" />
        )}

        <ProjectFilterPanel tags={tags} />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" size="md">
              <ArrowUpDown aria-hidden="true" />
              <span className="hidden sm:inline">{PROJECT_SORT_LABELS[store.sort]}</span>
              <span className="sm:hidden">Sort</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              collisionPadding={16}
              className="z-90 min-w-56 rounded-[10px] border border-border bg-surface-raised p-1 shadow-raised"
            >
              <DropdownMenu.RadioGroup
                value={store.sort}
                onValueChange={(value) => store.setSort(value as ProjectSort)}
              >
                {PROJECT_SORTS.map((sort) => (
                  <DropdownMenu.RadioItem
                    key={sort}
                    value={sort}
                    className="flex cursor-default items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-muted"
                  >
                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        store.sort === sort ? 'bg-primary' : 'bg-transparent',
                      )}
                      aria-hidden="true"
                    />
                    {PROJECT_SORT_LABELS[sort]}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div
          role="radiogroup"
          aria-label="Layout"
          className="flex items-center gap-0.5 rounded-control border border-border bg-surface p-0.5"
        >
          {(['grid', 'list'] as const).map((layout) => {
            const Icon = layout === 'grid' ? LayoutGrid : List
            const selected = store.layout === layout
            return (
              <button
                key={layout}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${layout === 'grid' ? 'Grid' : 'List'} layout`}
                onClick={() => store.setLayout(layout)}
                className={cn(
                  'grid size-7 place-items-center rounded-[6px] transition-colors',
                  selected
                    ? 'bg-surface-raised text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </div>

      {activeFilters > 0 ? <ActiveFilterChips /> : null}
    </div>
  )
}

/** Applied filters stay visible after the panel closes, and are removable inline. */
function ActiveFilterChips() {
  const store = useProjectStore()

  const chips = [
    ...store.statuses.map((value) => ({
      key: `status:${value}`,
      label: STATUS_META[value].label,
      remove: () => store.toggleStatus(value),
    })),
    ...store.priorities.map((value) => ({
      key: `priority:${value}`,
      label: PRIORITY_META[value].label,
      remove: () => store.togglePriority(value),
    })),
    ...store.types.map((value) => ({
      key: `type:${value}`,
      label: TYPE_META[value].label,
      remove: () => store.toggleType(value),
    })),
    ...store.tags.map((value) => ({
      key: `tag:${value}`,
      label: value,
      remove: () => store.toggleTag(value),
    })),
  ]

  return (
    <ul className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Badge tone="primary" size="md" className="pr-1">
            {chip.label}
            <button
              type="button"
              onClick={chip.remove}
              className="rounded-full p-0.5 transition-colors hover:bg-primary/15"
              aria-label={`Remove ${chip.label} filter`}
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </Badge>
        </li>
      ))}
      <li>
        <Button variant="ghost" size="sm" onClick={() => store.clearFilters()}>
          Clear all
        </Button>
      </li>
    </ul>
  )
}
