import { HardDrive, ShieldCheck, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface LocalDataNoticeProps {
  /** `compact` for in-context reminders, `full` for Settings. */
  variant?: 'compact' | 'full'
  className?: string
}

const BENEFITS = [
  'No account, no server, no tracking — nothing is ever uploaded.',
  'Client budgets, deadlines and commercial goals stay on this machine.',
  'Works with the network switched off.',
]

const CONSEQUENCES = [
  'Clearing your browser data — or private browsing — deletes every project permanently.',
  'There is no backup and no recovery: nobody else holds a copy.',
  'Projects do not sync. They exist only in this browser, on this device.',
  'A different browser, profile or computer will show an empty ReqStudio.',
]

/**
 * States the local-first bargain in both directions.
 *
 * The privacy win and the data-loss risk are the same fact seen from two sides,
 * so they are always shown together — a notice that only advertises the upside
 * would be selling the user a surprise.
 */
export function LocalDataNotice({ variant = 'compact', className }: LocalDataNoticeProps) {
  if (variant === 'compact') {
    return (
      <aside
        aria-label="Where your data is stored"
        className={cn(
          'flex flex-col gap-3 rounded-card border border-border bg-surface-raised p-4 sm:flex-row sm:items-start sm:gap-4',
          className,
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-primary-soft text-primary-text">
          <HardDrive className="size-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            Everything you write stays in this browser
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            No account, no server, no tracking — which also means{' '}
            <span className="font-medium text-foreground">
              clearing your browser data deletes every project permanently
            </span>
            , with no backup to restore from and no sync to another device. Print or export anything
            you cannot afford to lose.
          </p>
        </div>
      </aside>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-2', className)}>
      <section className="rounded-card border border-success/30 bg-success-soft/60 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
          Why this is good
        </h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {BENEFITS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-card border border-warning/40 bg-warning/5 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden="true" />
          What it costs you
        </h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {CONSEQUENCES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
