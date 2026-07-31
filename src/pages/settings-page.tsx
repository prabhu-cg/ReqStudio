import { useEffect, useState } from 'react'
import { Database, Info, Palette, Save, ShieldCheck, Trash2, Type } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Label, Separator, Switch } from '@/components/ui/primitives'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { LocalDataNotice } from '@/components/common/local-data-notice'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import {
  useSettingsStore,
  type FontSizePreference,
} from '@/stores/settings-store'
import { useUIStore } from '@/stores/ui-store'
import { estimateStorage, resetDatabase } from '@/lib/db'
import { useProjectSummaries } from '@/features/projects/hooks/use-projects'
import { pluralize } from '@/lib/utils/text'
import { cn } from '@/lib/utils/cn'
import { briefSections } from '@/features/brief/sections'
import type { ReactNode } from 'react'

const FONT_SIZES: Array<{ value: FontSizePreference; label: string; sample: string }> = [
  { value: 'sm', label: 'Compact', sample: 'text-xs' },
  { value: 'md', label: 'Default', sample: 'text-sm' },
  { value: 'lg', label: 'Large', sample: 'text-base' },
]

export function SettingsPage() {
  const settings = useSettingsStore()
  const toast = useUIStore((state) => state.toast)
  const summaries = useProjectSummaries()
  const [confirmReset, setConfirmReset] = useState(false)
  const [usage, setUsage] = useState<number | null>(null)

  useEffect(() => {
    void estimateStorage().then((estimate) => setUsage(estimate?.usage ?? null))
  }, [summaries])

  const projectCount = summaries?.length ?? 0
  const pageCount = summaries?.reduce((total, summary) => total + summary.pageCount, 0) ?? 0

  return (
    <div className="rs-scroll-area h-full overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 p-4 lg:p-8">
      <PageHeader
        title="Settings"
        description="Preferences are stored in this browser and apply to every project."
      />

      <SettingsSection icon={<Palette className="size-4" aria-hidden="true" />} title="Appearance">
        <SettingRow label="Theme" description="Light, dark, or follow your operating system.">
          <ThemeToggle />
        </SettingRow>

        <Separator />

        <SettingRow
          label="Font size"
          description="Scales the whole interface, not just body copy."
        >
          <div
            role="radiogroup"
            aria-label="Font size"
            className="flex items-center gap-0.5 rounded-[8px] border border-border bg-surface p-0.5"
          >
            {FONT_SIZES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={settings.fontSize === option.value}
                onClick={() => settings.setFontSize(option.value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors',
                  settings.fontSize === option.value
                    ? 'bg-surface-raised text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Type className={cn('size-3.5', option.sample)} aria-hidden="true" />
                {option.label}
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingsSection>

      <SettingsSection icon={<Save className="size-4" aria-hidden="true" />} title="Editing">
        <SettingRow
          label="Autosave"
          description="Write every change to local storage automatically. Turning this off means changes are only kept while a form is open."
          htmlFor="autosave-toggle"
        >
          <Switch
            id="autosave-toggle"
            checked={settings.autosaveEnabled}
            onCheckedChange={settings.setAutosaveEnabled}
          />
        </SettingRow>

        <Separator />

        <SettingRow
          label="Autosave delay"
          description="How long to wait after you stop typing."
        >
          <div
            role="radiogroup"
            aria-label="Autosave delay"
            className="flex items-center gap-0.5 rounded-[8px] border border-border bg-surface p-0.5"
          >
            {[300, 600, 1200].map((delay) => (
              <button
                key={delay}
                type="button"
                role="radio"
                aria-checked={settings.autosaveDelay === delay}
                disabled={!settings.autosaveEnabled}
                onClick={() => settings.setAutosaveDelay(delay)}
                className={cn(
                  'rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
                  settings.autosaveDelay === delay
                    ? 'bg-surface-raised text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {delay}ms
              </button>
            ))}
          </div>
        </SettingRow>

        <Separator />

        <SettingRow
          label="Completion hints"
          description="Show the “still required” banner at the top of each brief section."
          htmlFor="hints-toggle"
        >
          <Switch
            id="hints-toggle"
            checked={settings.showCompletionHints}
            onCheckedChange={settings.setShowCompletionHints}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection icon={<Database className="size-4" aria-hidden="true" />} title="Local data">
        <LocalDataNotice variant="full" />

        <Separator />

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DataStat label="Projects" value={String(projectCount)} />
          <DataStat label="Pages" value={String(pageCount)} />
          <DataStat label="Sections" value={String(briefSections.length)} />
          <DataStat
            label="Storage used"
            value={usage === null ? '—' : `${(usage / 1024).toFixed(0)} KB`}
          />
        </dl>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-danger">Reset local data</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Permanently deletes {pluralize(projectCount, 'project')} and{' '}
              {pluralize(pageCount, 'page')} from this browser.
            </p>
          </div>
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            <Trash2 aria-hidden="true" />
            Reset all data
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection icon={<Info className="size-4" aria-hidden="true" />} title="About ReqStudio">
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            ReqStudio is a free, local-first studio for project requirements and website briefs,
            built for designers, business analysts, product managers and project managers.
          </p>
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            <span>
              No account, no server, no tracking. Every project lives in this browser&rsquo;s
              IndexedDB and never leaves the device.
            </span>
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DataStat label="Version" value="1.0.0 — Phase 1" />
            <DataStat label="Storage" value="IndexedDB" />
            <DataStat label="Licence" value="Free to use" />
          </dl>
        </div>
      </SettingsSection>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset local data"
        description="Every project, page and activity record in this browser will be deleted. This cannot be undone and there is no backup."
        confirmLabel="Delete everything"
        onConfirm={async () => {
          await resetDatabase()
          toast({ title: 'Local data cleared', variant: 'danger' })
        }}
        />
      </div>
    </div>
  )
}

function SettingsSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-card border border-border bg-surface-raised">
      <header className="flex items-center gap-2 border-b border-border px-6 py-4">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </header>
      <div className="flex flex-col gap-5 p-6">{children}</div>
    </section>
  )
}

function SettingRow({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string
  description: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 max-w-md">
        {htmlFor ? (
          <Label htmlFor={htmlFor}>{label}</Label>
        ) : (
          <p className="text-sm font-medium">{label}</p>
        )}
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function DataStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
    </div>
  )
}
