import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { FieldDef, SectionValues } from './field'
import type { Project, ProjectPage } from './project'
import type { DateFormatPattern, DocBlock } from './document'

export interface SectionPaneProps {
  project: Project
  pages: ProjectPage[]
  /** Panes hide their editing affordances when the project is locked. */
  readOnly?: boolean
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
  /**
   * Emits document blocks instead of the generic field rendering.
   *
   * The preview, PDF, Word, Markdown and HTML outputs all render whatever this
   * returns, so a section with a bespoke shape — a sitemap, a complexity
   * matrix — describes itself once and appears correctly everywhere.
   */
  documentBlocks?: (context: SectionDocumentContext) => DocBlock[]
}

export interface SectionDocumentContext {
  values: SectionValues
  project: Project
  pages: ProjectPage[]
  dateFormat: DateFormatPattern
  /** True when the reader asked to see unanswered fields. */
  includeEmpty: boolean
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
