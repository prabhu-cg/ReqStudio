import type { SectionDefinition } from '@/types/section'
import { projectOverviewSection } from './01-project-overview'
import { businessGoalsSection } from './02-business-goals'
import { targetAudienceSection } from './03-target-audience'
import { websiteStructureSection } from './04-website-structure'
import { pageRequirementsSection } from './05-page-requirements'
import { functionalRequirementsSection } from './06-functional-requirements'
import { contentInventorySection } from './07-content-inventory'
import { technicalRequirementsSection } from './08-technical-requirements'
import { risksAssumptionsSection } from './09-risks-assumptions'
import { approvalsSection } from './10-approvals'

/**
 * The brief section registry.
 *
 * This array is the single source of truth for the Brief tab, the outline, the
 * readiness score and the Preview report. A future phase adds a section by
 * appending one definition here — nothing else changes.
 */
const REGISTERED_SECTIONS: readonly SectionDefinition[] = [
  projectOverviewSection,
  businessGoalsSection,
  targetAudienceSection,
  websiteStructureSection,
  pageRequirementsSection,
  functionalRequirementsSection,
  contentInventorySection,
  technicalRequirementsSection,
  risksAssumptionsSection,
  approvalsSection,
]

export const briefSections: readonly SectionDefinition[] = [...REGISTERED_SECTIONS].sort(
  (a, b) => a.order - b.order,
)

const sectionsById = new Map(briefSections.map((section) => [section.id, section]))

export function getSection(id: string): SectionDefinition | undefined {
  return sectionsById.get(id)
}

export function sectionIndex(id: string): number {
  return briefSections.findIndex((section) => section.id === id)
}

export const firstSectionId = briefSections[0]!.id
