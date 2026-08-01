import type { DocumentMeta } from '@/types/document'
import { Logo } from '@/components/layout/logo'

/**
 * The running header.
 *
 * On screen it sits at the top of the document surface; in print it repeats the
 * project identity that the PDF and Word exports draw on every page.
 */
export function DocumentHeader({ meta }: { meta: DocumentMeta }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-8 py-3 sm:px-12">
      <div className="flex min-w-0 items-center gap-3">
        <Logo className="h-5 w-auto shrink-0" />
        <span className="truncate text-xs font-medium text-muted-foreground">
          {meta.projectName}
        </span>
      </div>
      <span className="shrink-0 text-xs font-semibold tabular-nums text-primary-text">
        {meta.version}
      </span>
    </header>
  )
}
