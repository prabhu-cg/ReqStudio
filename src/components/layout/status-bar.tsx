import { useEffect, useState } from 'react'
import { Database, HardDrive, Wifi, WifiOff } from 'lucide-react'
import { estimateStorage } from '@/lib/db'
import { useProjectSummaries } from '@/features/projects/hooks/use-projects'
import { SaveIndicator } from './save-indicator'
import { pluralize } from '@/lib/utils/text'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`
}

/** Persistent footer: local storage footprint, connectivity and save state. */
export function StatusBar() {
  const summaries = useProjectSummaries()
  const [usage, setUsage] = useState<string | null>(null)
  const [online, setOnline] = useState(() => navigator.onLine)

  const projectCount = summaries?.length ?? 0
  const pageCount = summaries?.reduce((total, summary) => total + summary.pageCount, 0) ?? 0

  // Keyed on the counts rather than the array: useLiveQuery hands back a new
  // array on every write, and navigator.storage.estimate() returns a figure
  // that drifts between calls, so re-running per write made the number flicker.
  useEffect(() => {
    let cancelled = false
    void estimateStorage().then((estimate) => {
      if (cancelled || !estimate) return
      const next = formatBytes(estimate.usage)
      setUsage((current) => (current === next ? current : next))
    })
    return () => {
      cancelled = true
    }
  }, [projectCount, pageCount])

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  return (
    <footer className="flex h-8 shrink-0 items-center gap-4 border-t border-border bg-surface px-4 text-[11px] text-muted-foreground lg:px-6">
      <span className="flex items-center gap-1.5">
        <Database className="size-3" aria-hidden="true" />
        {pluralize(projectCount, 'project')} · {pluralize(pageCount, 'page')}
      </span>

      {usage !== null ? (
        <span className="hidden items-center gap-1.5 sm:flex">
          <HardDrive className="size-3" aria-hidden="true" />
          {usage} stored locally
        </span>
      ) : null}

      <span className="hidden items-center gap-1.5 md:flex">
        {online ? (
          <>
            <Wifi className="size-3" aria-hidden="true" />
            Online — data never leaves this device
          </>
        ) : (
          <>
            <WifiOff className="size-3" aria-hidden="true" />
            Offline — ReqStudio works exactly the same
          </>
        )}
      </span>

      <SaveIndicator className="ml-auto" />
    </footer>
  )
}
