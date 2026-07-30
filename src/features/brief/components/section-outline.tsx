import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { briefSections } from '../sections'
import type { SectionCompletion, SectionStatus } from '@/types/section'

export interface SectionOutlineProps {
  completions: SectionCompletion[]
  activeId: string
  onSelect: (sectionId: string) => void
  className?: string
}

const STATUS_LABEL: Record<SectionStatus, string> = {
  complete: 'Complete',
  'in-progress': 'In progress',
  empty: 'Not started',
}

/**
 * Section list with live per-section completion.
 *
 * Each row carries the section's own icon — the same one shown beside the
 * section heading — so selecting a row and reading the pane agree visually.
 * Completion state is carried by the tile's colour plus the percentage, and is
 * spelled out for screen readers.
 */
export function SectionOutline({
  completions,
  activeId,
  onSelect,
  className,
}: SectionOutlineProps) {
  const byId = new Map(completions.map((completion) => [completion.sectionId, completion]))

  return (
    <nav aria-label="Brief sections" className={cn('flex flex-col gap-1', className)}>
      {briefSections.map((section, index) => {
        const completion = byId.get(section.id)
        const status = completion?.status ?? 'empty'
        const isActive = section.id === activeId
        const Icon = section.icon

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-[8px] px-2.5 py-2 text-left transition-colors',
              isActive ? 'bg-primary-soft' : 'hover:bg-muted',
            )}
          >
            <span
              className={cn(
                'relative grid size-7 shrink-0 place-items-center rounded-[8px] border transition-colors',
                isActive && 'border-primary/40 bg-primary-soft text-primary-text',
                !isActive && status === 'complete' && 'border-success/30 bg-success-soft text-success',
                !isActive && status === 'in-progress' && 'border-primary/25 bg-primary-soft text-primary-text',
                !isActive && status === 'empty' && 'border-border bg-muted text-muted-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {status === 'complete' ? (
                <span
                  className="absolute -bottom-0.5 -right-0.5 grid size-3 place-items-center rounded-full bg-success text-white dark:text-[#10281c]"
                  aria-hidden="true"
                >
                  <Check className="size-2" strokeWidth={4} />
                </span>
              ) : null}
            </span>

            <span
              className={cn(
                'min-w-0 flex-1 truncate text-sm font-medium',
                isActive ? 'text-primary-text' : 'text-foreground',
              )}
            >
              <span className="mr-1.5 text-muted-foreground tabular-nums">{index + 1}.</span>
              {section.title}
            </span>

            <span
              className={cn(
                'shrink-0 text-xs tabular-nums',
                status === 'complete' ? 'text-success' : 'text-muted-foreground',
              )}
            >
              {completion?.percent ?? 0}%
              <span className="sr-only"> complete — {STATUS_LABEL[status]}</span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
