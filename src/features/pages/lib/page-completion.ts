import type { ProjectPage } from '@/types/project'

/** Fields that constitute a "complete" page, in the order shown in the drawer. */
export const PAGE_SCORED_FIELDS = [
  { key: 'name', label: 'Page name', required: true },
  { key: 'purpose', label: 'Purpose', required: true },
  { key: 'audience', label: 'Audience', required: false },
  { key: 'summary', label: 'Summary', required: false },
  { key: 'businessGoal', label: 'Business goal', required: false },
  { key: 'primaryCta', label: 'Primary CTA', required: true },
  { key: 'secondaryCta', label: 'Secondary CTA', required: false },
  { key: 'contentRequirements', label: 'Content requirements', required: false },
  { key: 'requiredComponents', label: 'Required components', required: false },
  { key: 'dependencies', label: 'Dependencies', required: false },
  { key: 'seoNotes', label: 'SEO notes', required: false },
  { key: 'accessibilityNotes', label: 'Accessibility notes', required: false },
  { key: 'analytics', label: 'Analytics', required: false },
] as const satisfies ReadonlyArray<{ key: keyof ProjectPage; label: string; required: boolean }>

function isFilled(page: ProjectPage, key: keyof ProjectPage): boolean {
  const value = page[key]
  if (Array.isArray(value)) return value.filter((item) => item.trim()).length > 0
  if (typeof value === 'string') return value.trim().length > 0
  return value != null
}

/** 0–100 for a single page. `internalNotes` is deliberately not scored. */
export function pageCompletion(page: ProjectPage): number {
  const filled = PAGE_SCORED_FIELDS.filter((field) => isFilled(page, field.key)).length
  return Math.round((filled / PAGE_SCORED_FIELDS.length) * 100)
}

export function pageMissingFields(page: ProjectPage): string[] {
  return PAGE_SCORED_FIELDS.filter((field) => !isFilled(page, field.key)).map(
    (field) => field.label,
  )
}
