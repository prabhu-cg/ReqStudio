import type { Project, ProjectPage } from '@/types/project'
import type { ReadinessReport } from '@/types/section'
import type { RepeaterRow } from '@/types/field'
import type { DocBlock, DocumentSettings } from '@/types/document'
import { PRIORITY_META, typeLabel } from '@/features/projects/lib/project-display'
import { compact, callout, fields, paragraph } from './blocks'
import { formatDocDate } from './format-value'

/**
 * The executive summary, assembled from template logic.
 *
 * No AI: this reads what the brief already says and states it plainly. Every
 * lookup is defensive, so a half-finished brief produces a shorter summary
 * rather than a broken one.
 */

/** Below this the brief is flagged as not yet ready to circulate. */
const READY_THRESHOLD = 75
const THIN_THRESHOLD = 40

function readString(project: Project, sectionId: string, field: string): string {
  const value = project.brief[sectionId]?.[field]
  return typeof value === 'string' ? value.trim() : ''
}

function readRows(project: Project, sectionId: string, field: string): RepeaterRow[] {
  const value = project.brief[sectionId]?.[field]
  return Array.isArray(value) ? (value as RepeaterRow[]) : []
}

function readList(project: Project, sectionId: string, field: string): string[] {
  const value = project.brief[sectionId]?.[field]
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
}

/** Trims a long free-text answer down to its first sentence or two. */
function firstSentences(text: string, max = 240): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastStop = cut.lastIndexOf('. ')
  return lastStop > max * 0.5 ? cut.slice(0, lastStop + 1) : `${cut.trimEnd()}…`
}

export function buildExecutiveSummary(
  project: Project,
  pages: ProjectPage[],
  readiness: ReadinessReport,
  settings: DocumentSettings,
): DocBlock[] {
  const overview = readString(project, 'project-overview', 'summary')
  const problem = readString(project, 'project-overview', 'problemStatement')
  const primaryGoal = readString(project, 'business-goals', 'primaryGoal')
  const audience = readString(project, 'target-audience', 'primaryAudience')
  const objectives = readList(project, 'project-overview', 'objectives')
  const inScope = readList(project, 'project-overview', 'inScope')
  const requirements = readRows(project, 'functional-requirements', 'requirements')
  const risks = readRows(project, 'risks-assumptions', 'risks')

  return compact([
    paragraph(openingSentence(project, overview), 'lead'),
    problem && !overview ? paragraph(firstSentences(problem)) : null,
    fields(
      [
        { label: 'Project', value: project.name || 'Untitled project' },
        { label: 'Client', value: project.client || 'Not recorded' },
        { label: 'Project type', value: typeLabel(project.type) },
        primaryGoal ? { label: 'Primary goal', value: firstSentences(primaryGoal) } : null,
        audience ? { label: 'Target audience', value: firstSentences(audience) } : null,
        { label: 'Scope', value: scopeSentence(pages.length, requirements.length, inScope.length) },
        { label: 'Timeline', value: timelineSentence(project, settings) },
        { label: 'Priority', value: PRIORITY_META[project.priority].label },
        { label: 'Completion', value: `${readiness.score}% of the brief is complete` },
      ].filter((item): item is { label: string; value: string } => item !== null),
    ),
    objectives.length > 0
      ? paragraph(
          `The work is measured against ${objectives.length} stated ${objectives.length === 1 ? 'objective' : 'objectives'}, set out in section 1.`,
          'muted',
        )
      : null,
    readinessCallout(readiness, risks.length),
  ])
}

function openingSentence(project: Project, overview: string): string {
  const name = project.name || 'This project'
  const type = typeLabel(project.type).toLowerCase()
  const client = project.client ? ` for ${project.client}` : ''
  const lead = `${name} is a ${type} project${client}.`
  return overview ? `${lead} ${firstSentences(overview, 400)}` : lead
}

function scopeSentence(pageCount: number, requirementCount: number, scopeItems: number): string {
  const parts: string[] = []
  if (pageCount > 0) parts.push(`${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`)
  if (requirementCount > 0) {
    parts.push(`${requirementCount} functional ${requirementCount === 1 ? 'requirement' : 'requirements'}`)
  }
  if (scopeItems > 0) parts.push(`${scopeItems} in-scope ${scopeItems === 1 ? 'item' : 'items'}`)
  return parts.length > 0 ? parts.join(', ') : 'Scope not yet defined'
}

function timelineSentence(project: Project, settings: DocumentSettings): string {
  const start = formatDocDate(project.startDate, settings.dateFormat)
  const target = formatDocDate(project.targetDate, settings.dateFormat)
  if (start && target) return `${start} to ${target}`
  if (target) return `Target ${target}`
  if (start) return `Starts ${start}`
  return 'Dates not yet agreed'
}

function readinessCallout(readiness: ReadinessReport, riskCount: number): DocBlock {
  const outstanding = readiness.missingSections.length

  if (readiness.score >= 100) {
    return callout(
      'success',
      `Every section of this brief is complete${riskCount > 0 ? `, with ${riskCount} ${riskCount === 1 ? 'risk' : 'risks'} on the register` : ''}. The document is ready for sign-off.`,
      'Ready for approval',
    )
  }

  if (readiness.score >= READY_THRESHOLD) {
    return callout(
      'info',
      `This brief is ${readiness.score}% complete. ${outstanding} ${outstanding === 1 ? 'section still has' : 'sections still have'} outstanding answers — see the appendix for the full list.`,
      'Nearly complete',
    )
  }

  return callout(
    readiness.score >= THIN_THRESHOLD ? 'warning' : 'risk',
    `This brief is ${readiness.score}% complete and should be treated as a working draft. ${outstanding} ${outstanding === 1 ? 'section is' : 'sections are'} unfinished; estimates and commitments based on it carry risk.`,
    'Draft — not yet ready for sign-off',
  )
}
