import type { Project, ProjectPage } from '@/types/project'
import type {
  ReadinessReport,
  Recommendation,
  SectionCompletion,
  SectionDefinition,
  SectionStatus,
} from '@/types/section'
import { scoreFields, toPercent } from '@/lib/fields/completion'
import { withDefaults } from '@/lib/fields/value'
import { briefSections } from '../sections'
import { pageCompletion } from '@/features/pages/lib/page-completion'
import { daysUntil } from '@/lib/utils/date'

function statusFor(percent: number): SectionStatus {
  if (percent <= 0) return 'empty'
  return percent >= 100 ? 'complete' : 'in-progress'
}

export function computeSectionCompletion(
  section: SectionDefinition,
  project: Project,
  pages: ProjectPage[],
): SectionCompletion {
  const values = withDefaults(section.fields, project.brief[section.id])
  const result = section.completion
    ? section.completion({ values, project, pages })
    : scoreFields(section.fields, values)

  const percent = toPercent(result.completed, result.total)

  return {
    sectionId: section.id,
    title: section.title,
    completed: result.completed,
    total: result.total,
    percent,
    status: statusFor(percent),
    missingRequired: result.missingRequired,
    missingOptional: result.missingOptional,
  }
}

/**
 * Weighted readiness across every registered section.
 *
 * Sections declare their own weight, so re-balancing the score — or adding an
 * eleventh section — never touches this function.
 */
export function computeReadiness(project: Project, pages: ProjectPage[]): ReadinessReport {
  const sections = briefSections.map((section) => computeSectionCompletion(section, project, pages))

  let weighted = 0
  let weightTotal = 0
  for (const [index, section] of briefSections.entries()) {
    const weight = section.weight ?? 1
    weighted += (sections[index]?.percent ?? 0) * weight
    weightTotal += weight
  }

  const score = weightTotal > 0 ? Math.round(weighted / weightTotal) : 0

  return {
    score,
    sections,
    missingSections: sections
      .filter((section) => section.status !== 'complete')
      .map((section) => ({ id: section.sectionId, title: section.title })),
    recommendations: buildRecommendations(project, pages, sections),
  }
}

/**
 * Recommendation rules.
 *
 * Each rule is independent and returns zero or more recommendations, so new
 * advice can be added without touching existing rules.
 */
type RecommendationRule = (context: {
  project: Project
  pages: ProjectPage[]
  sections: SectionCompletion[]
}) => Recommendation[]

const rules: RecommendationRule[] = [
  ({ sections }) =>
    sections
      .filter((section) => section.missingRequired.length > 0)
      .map((section) => ({
        id: `required:${section.sectionId}`,
        sectionId: section.sectionId,
        severity: 'critical' as const,
        message: `${section.title} is missing ${section.missingRequired.length === 1 ? 'a required answer' : `${section.missingRequired.length} required answers`}: ${section.missingRequired.slice(0, 3).join(', ')}${section.missingRequired.length > 3 ? '…' : ''}`,
      })),

  ({ sections }) =>
    sections
      .filter((section) => section.status === 'empty' && section.missingRequired.length === 0)
      .map((section) => ({
        id: `empty:${section.sectionId}`,
        sectionId: section.sectionId,
        severity: 'warning' as const,
        message: `${section.title} has not been started.`,
      })),

  ({ pages }) => {
    if (pages.length === 0) return []
    const thin = pages.filter((page) => pageCompletion(page) < 50)
    if (thin.length === 0) return []
    return [
      {
        id: 'pages:thin',
        sectionId: 'page-requirements',
        severity: 'warning',
        message: `${thin.length} of ${pages.length} pages are less than half specified — ${thin
          .slice(0, 3)
          .map((page) => page.name || 'Untitled')
          .join(', ')}${thin.length > 3 ? '…' : ''}.`,
      },
    ]
  },

  ({ pages }) => {
    const missing = pages.filter((page) => !page.accessibilityNotes.trim())
    if (missing.length === 0) return []
    return [
      {
        id: 'pages:accessibility',
        sectionId: 'page-requirements',
        severity: 'suggestion',
        message: `${missing.length} ${missing.length === 1 ? 'page has' : 'pages have'} no accessibility notes.`,
      },
    ]
  },

  ({ project }) => {
    const days = daysUntil(project.targetDate)
    if (days === null || project.status === 'completed' || project.status === 'archived') return []
    if (days < 0) {
      return [
        {
          id: 'schedule:overdue',
          sectionId: null,
          severity: 'critical',
          message: `The target date passed ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} ago — confirm the timeline with stakeholders.`,
        },
      ]
    }
    if (days <= 7) {
      return [
        {
          id: 'schedule:imminent',
          sectionId: null,
          severity: 'warning',
          message: `Target date is ${days === 0 ? 'today' : `in ${days} ${days === 1 ? 'day' : 'days'}`}.`,
        },
      ]
    }
    return []
  },

  ({ project }) =>
    project.stakeholders.length === 0
      ? [
          {
            id: 'project:stakeholders',
            sectionId: null,
            severity: 'suggestion',
            message: 'No stakeholders recorded — add them so approvals have a named audience.',
          },
        ]
      : [],
]

function buildRecommendations(
  project: Project,
  pages: ProjectPage[],
  sections: SectionCompletion[],
): Recommendation[] {
  const severityOrder = { critical: 0, warning: 1, suggestion: 2 }
  return rules
    .flatMap((rule) => rule({ project, pages, sections }))
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
}

/** Shorthand used by dashboard cards, which only need the headline number. */
export function readinessScore(project: Project, pages: ProjectPage[]): number {
  return computeReadiness(project, pages).score
}

export function readinessBand(score: number): 'low' | 'medium' | 'high' | 'complete' {
  if (score >= 100) return 'complete'
  if (score >= 75) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}
