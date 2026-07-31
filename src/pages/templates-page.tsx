import { Layers } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { EmptyState } from '@/components/common/empty-state'

/** Placeholder for a later phase — reachable by URL, disabled in navigation. */
export function TemplatesPage() {
  return (
    <div className="rs-scroll-area h-full overflow-y-auto">
      <div className="rs-page flex flex-col gap-6 p-4 lg:p-8">
      <PageHeader title="Templates" description="Reusable brief starting points." />
      <EmptyState
        icon={Layers}
        title="Templates are coming later"
        description="Phase 1 focuses on creating and completing briefs from scratch. Templates will build on the same section registry."
      />
      </div>
    </div>
  )
}
