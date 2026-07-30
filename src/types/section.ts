import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { FieldDef, SectionValues } from './field'
import type { Project, ProjectPage } from './project'

export interface SectionPaneProps {
  project: Project
  pages: ProjectPage[]
}

export interface SectionCompletionContext {
  values: SectionValues
  project: Project
  pages: ProjectPage[]
}

export type SectionStatus = 'empty' | 'in-progress' | 'complete'

export interface SectionCompletion {
  sectionId: string
  title: string
  /** Weighted units satisfied. */
  completed: number
  total: number
  percent: number
  status: SectionStatus
  missingRequired: string[]
  missingOptional: string[]
}

/**
 * A brief section, described declaratively.
 *
 * Adding a section in a future phase means adding one definition file and
 * registering it — form rendering, validation, completion scoring, the readiness
 * report, the outline and the preview all pick it up automatically.
 */
export interface SectionDefinition {
  id: string
  order: number
  title: string
  description: string
  icon: LucideIcon
  /** Relative importance in the readiness score. Defaults to 1. */
  weight?: number
  fields: readonly FieldDef[]
  /** Renders instead of the schema-driven form (used by Page Requirements). */
  pane?: ComponentType<SectionPaneProps>
  /** Overrides the default field-count completion maths. */
  completion?: (context: SectionCompletionContext) => Pick<
    SectionCompletion,
    'completed' | 'total' | 'missingRequired' | 'missingOptional'
  >
  /** Rendered in Preview instead of the generic field list. */
  preview?: ComponentType<SectionPaneProps>
}

export interface Recommendation {
  id: string
  sectionId: string | null
  severity: 'critical' | 'warning' | 'suggestion'
  message: string
}

export interface ReadinessReport {
  /** 0–100, weighted across all registered sections. */
  score: number
  sections: SectionCompletion[]
  missingSections: Array<{ id: string; title: string }>
  recommendations: Recommendation[]
}
