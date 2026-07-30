import type { SectionDefinition } from '@/types/section'
import type { Project, ProjectPage } from '@/types/project'
import type { FieldValue, RepeaterRow } from '@/types/field'

function flatten(value: FieldValue): string {
  if (value == null) return ''
  if (typeof value === 'boolean') return value ? 'yes' : 'no'
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === 'string'
          ? item
          : Object.values(item as RepeaterRow)
              .map((cell) => flatten(cell as FieldValue))
              .join(' '),
      )
      .join(' ')
  }
  return ''
}

/**
 * Flattens a section to plain text.
 *
 * Powers Preview search today, and is the natural input for the Markdown/HTML
 * exporters added in a later phase.
 */
export function serializeSection(
  section: SectionDefinition,
  project: Project,
  pages: ProjectPage[],
): string {
  const values = project.brief[section.id] ?? {}
  const parts = section.fields.map((field) => `${field.label} ${flatten(values[field.name])}`)

  if (section.id === 'page-requirements') {
    parts.push(
      pages
        .map((page) =>
          [
            page.name,
            page.purpose,
            page.audience,
            page.summary,
            page.businessGoal,
            page.primaryCta,
            page.secondaryCta,
            page.contentRequirements.join(' '),
            page.requiredComponents.join(' '),
            page.dependencies.join(' '),
            page.seoNotes,
            page.accessibilityNotes,
            page.analytics,
          ].join(' '),
        )
        .join(' '),
    )
  }

  return parts.join(' ')
}

export function serializeBrief(
  sections: readonly SectionDefinition[],
  project: Project,
  pages: ProjectPage[],
): string {
  return sections.map((section) => serializeSection(section, project, pages)).join('\n')
}
