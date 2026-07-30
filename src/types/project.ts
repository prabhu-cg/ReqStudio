import type { BaseEntity } from './entity'
import type { SectionValues } from './field'

export const PROJECT_STATUSES = ['draft', 'active', 'completed', 'archived'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number]

export const PROJECT_TYPES = [
  'marketing-website',
  'web-application',
  'ecommerce',
  'redesign',
  'intranet',
  'design-system',
  'mobile-app',
  'other',
] as const
export type ProjectType = (typeof PROJECT_TYPES)[number]

/** Section values, keyed by section id. Unknown keys are preserved untouched. */
export type BriefData = Record<string, SectionValues>

export interface Project extends BaseEntity {
  name: string
  client: string
  type: ProjectType
  description: string
  designer: string
  stakeholders: string[]
  startDate: string | null
  targetDate: string | null
  priority: ProjectPriority
  tags: string[]
  status: ProjectStatus
  pinned: boolean
  lastOpenedAt: string | null
  brief: BriefData
}

/** Every field captured for a single page in the Page Requirements section. */
export interface ProjectPage extends BaseEntity {
  projectId: string
  order: number
  name: string
  purpose: string
  audience: string
  summary: string
  businessGoal: string
  primaryCta: string
  secondaryCta: string
  contentRequirements: string[]
  requiredComponents: string[]
  dependencies: string[]
  seoNotes: string
  accessibilityNotes: string
  analytics: string
  internalNotes: string
}

export const ACTIVITY_TYPES = [
  'project.created',
  'project.updated',
  'project.status-changed',
  'project.deleted',
  'brief.updated',
  'page.created',
  'page.updated',
  'page.deleted',
] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export interface ActivityEvent extends BaseEntity {
  projectId: string
  type: ActivityType
  summary: string
  detail: string | null
}
