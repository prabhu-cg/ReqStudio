import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
  size?: 'sm' | 'md'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface text-center',
        size === 'md' ? 'px-6 py-16' : 'px-4 py-10',
        className,
      )}
    >
      <span
        className={cn(
          'grid place-items-center rounded-full bg-muted text-muted-foreground',
          size === 'md' ? 'size-12' : 'size-10',
        )}
      >
        <Icon className={size === 'md' ? 'size-6' : 'size-5'} aria-hidden="true" />
      </span>
      <h3 className={cn('mt-4 font-semibold tracking-tight', size === 'md' ? 'text-base' : 'text-sm')}>
        {title}
      </h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
