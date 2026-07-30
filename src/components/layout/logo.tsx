import { cn } from '@/lib/utils/cn'

/** ReqStudio mark — a document with a checked requirement line. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-[8px] bg-primary text-primary-foreground',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
        <path d="M14 3v5h5" strokeLinejoin="round" />
        <path d="m8.5 14 2 2 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <Logo />
      <span className="text-[15px] font-bold tracking-tight">
        Req<span className="text-primary-text">Studio</span>
      </span>
    </span>
  )
}
