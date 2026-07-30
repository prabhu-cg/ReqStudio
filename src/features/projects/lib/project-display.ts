import type { BadgeProps } from '@/components/ui/badge'
import type { ProjectPriority, ProjectStatus, ProjectType } from '@/types/project'
import type { SelectOption } from '@/types/field'

type Tone = NonNullable<BadgeProps['tone']>

export const STATUS_META: Record<ProjectStatus, { label: string; tone: Tone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  active: { label: 'Active', tone: 'primary' },
  completed: { label: 'Completed', tone: 'success' },
  archived: { label: 'Archived', tone: 'outline' },
}

export const PRIORITY_META: Record<ProjectPriority, { label: string; tone: Tone }> = {
  low: { label: 'Low', tone: 'neutral' },
  medium: { label: 'Medium', tone: 'info' },
  high: { label: 'High', tone: 'warning' },
  critical: { label: 'Critical', tone: 'danger' },
}

export const TYPE_META: Record<ProjectType, { label: string }> = {
  'marketing-website': { label: 'Marketing website' },
  'web-application': { label: 'Web application' },
  ecommerce: { label: 'E-commerce' },
  redesign: { label: 'Redesign' },
  intranet: { label: 'Intranet' },
  'design-system': { label: 'Design system' },
  'mobile-app': { label: 'Mobile app' },
  other: { label: 'Other' },
}

function toOptions<T extends string>(meta: Record<T, { label: string }>): SelectOption[] {
  return (Object.keys(meta) as T[]).map((value) => ({ value, label: meta[value].label }))
}

export const STATUS_OPTIONS = toOptions(STATUS_META)
export const PRIORITY_OPTIONS = toOptions(PRIORITY_META)
export const TYPE_OPTIONS = toOptions(TYPE_META)

export function statusLabel(status: ProjectStatus): string {
  return STATUS_META[status].label
}

export function typeLabel(type: ProjectType): string {
  return TYPE_META[type]?.label ?? type
}

export function priorityLabel(priority: ProjectPriority): string {
  return PRIORITY_META[priority].label
}

/** Colour band for the readiness ring/bar. */
export function readinessTone(score: number): Tone {
  if (score >= 100) return 'success'
  if (score >= 75) return 'primary'
  if (score >= 40) return 'warning'
  return 'danger'
}

export function readinessBarClass(score: number): string {
  if (score >= 100) return 'bg-success'
  if (score >= 75) return 'bg-primary'
  if (score >= 40) return 'bg-warning'
  return 'bg-danger'
}
