import type { Project, ProjectPage } from '@/types/project'
import type { ReadinessReport, SectionDefinition } from '@/types/section'
import type {
  DocBlock,
  DocFieldItem,
  DocText,
  DocumentCover,
  DocumentMeta,
  DocumentModel,
  DocumentSection,
  DocumentSettings,
  ExportOptions,
} from '@/types/document'
import { briefSections } from '@/features/brief/sections'
import { withDefaults } from '@/lib/fields/value'
import { pageCompletion } from '@/features/pages/lib/page-completion'
import {
  PRIORITY_META,
  STATUS_META,
  typeLabel,
} from '@/features/projects/lib/project-display'
import {
  bullets as bulletList,
  callout,
  compact,
  fields as fieldsBlock,
  heading,
  pageBreak,
  paragraph,
  section as makeSection,
  table,
} from '../lib/blocks'
import { fieldsToBlocks, type FormatContext } from '../lib/format-fields'
import { formatDocDate, stringsToBullets } from '../lib/format-value'
import { buildExecutiveSummary } from '../lib/executive-summary'
import { paginate } from '../lib/paginate'
import { computeStatistics } from '../lib/statistics'
import { formatVersion } from '../lib/document-settings'

/**
 * The brief document template.
 *
 * Compiles a project, its pages and its readiness report into the single
 * `DocumentModel` that the preview and all four exporters render. This is the
 * only module that knows the running order of a requirements brief — adding
 * "Sitemap" or "Complexity" sections in Phase 3 means appending to the section
 * list here, and every output picks them up.
 */

export interface BuildDocumentInput {
  project: Project
  pages: ProjectPage[]
  readiness: ReadinessReport
  settings: DocumentSettings
  options: ExportOptions
}

/** Contents entries that fit on one page of the generated table of contents. */
const TOC_ENTRIES_PER_PAGE = 38

export function buildDocument({
  project,
  pages,
  readiness,
  settings,
  options,
}: BuildDocumentInput): DocumentModel {
  const context: FormatContext = {
    dateFormat: settings.dateFormat,
    includeEmpty: options.includeEmptySections,
  }

  const generatedAt = new Date().toISOString()
  const meta = buildMeta(project, settings, generatedAt)
  const cover = buildCover(project, settings, generatedAt)
  const documentInfo = buildDocumentInfo(project, settings, readiness, generatedAt)

  const sections: DocumentSection[] = []

  if (options.includeExecutiveSummary) {
    sections.push(
      makeSection({
        id: 'executive-summary',
        number: '',
        title: 'Executive Summary',
        description: 'A one-page orientation for readers who will not read the rest.',
        blocks: buildExecutiveSummary(project, pages, readiness, settings),
      }),
    )
  }

  for (const definition of briefSections) {
    if (definition.id === 'approvals' && !options.includeApprovals) continue

    const built = buildBriefSection(definition, project, pages, readiness, context, options)
    if (!built) continue
    sections.push(...built)
  }

  if (options.includeAppendix) {
    sections.push(buildAppendix(project, readiness, context))
  }

  numberSections(sections)

  const frontMatterPages = countFrontMatterPages(options, sections.length)
  const totalPages = paginate(sections, settings, options, frontMatterPages + 1)

  const statistics = computeStatistics(sections, totalPages, pages.length, readiness.score)

  return { meta, cover, documentInfo, sections, statistics, settings, options }
}

/* -------------------------------------------------------------------------- */
/* Front matter                                                                */
/* -------------------------------------------------------------------------- */

function buildMeta(
  project: Project,
  settings: DocumentSettings,
  generatedAt: string,
): DocumentMeta {
  return {
    documentTitle: settings.documentTitle || `${project.name} — Requirements Brief`,
    projectName: project.name || 'Untitled project',
    version: formatVersion(settings.version),
    company: settings.company,
    preparedBy: settings.preparedBy || project.designer,
    approvedBy: settings.approvedBy,
    footerText: settings.footerText,
    generatedAt,
    generatedDate: formatDocDate(generatedAt, settings.dateFormat),
  }
}

function buildCover(
  project: Project,
  settings: DocumentSettings,
  generatedAt: string,
): DocumentCover {
  return {
    title: settings.documentTitle || `${project.name} — Requirements Brief`,
    subtitle: project.description?.trim() || 'Project requirements and website brief',
    projectName: project.name || 'Untitled project',
    client: project.client || 'Not recorded',
    organisation: settings.company || 'Not recorded',
    projectType: typeLabel(project.type),
    designer: settings.preparedBy || project.designer || 'Not recorded',
    preparedDate: formatDocDate(generatedAt, settings.dateFormat),
    version: formatVersion(settings.version),
    status: STATUS_META[project.status].label,
    logoText: settings.logoText || 'RS',
  }
}

function buildDocumentInfo(
  project: Project,
  settings: DocumentSettings,
  readiness: ReadinessReport,
  generatedAt: string,
): DocFieldItem[] {
  const items: DocFieldItem[] = [
    { label: 'Document title', value: settings.documentTitle },
    { label: 'Version', value: formatVersion(settings.version) },
    { label: 'Status', value: STATUS_META[project.status].label },
    { label: 'Project', value: project.name || 'Untitled project' },
    { label: 'Client', value: project.client || 'Not recorded' },
    { label: 'Project type', value: typeLabel(project.type) },
    { label: 'Priority', value: PRIORITY_META[project.priority].label },
    { label: 'Prepared by', value: settings.preparedBy || project.designer || 'Not recorded' },
  ]

  if (settings.company) items.push({ label: 'Organisation', value: settings.company })
  if (settings.approvedBy) items.push({ label: 'Approved by', value: settings.approvedBy })

  const start = formatDocDate(project.startDate, settings.dateFormat)
  const target = formatDocDate(project.targetDate, settings.dateFormat)
  if (start) items.push({ label: 'Start date', value: start })
  if (target) items.push({ label: 'Target date', value: target })

  if (project.stakeholders.length > 0) {
    items.push({ label: 'Stakeholders', value: '', bullets: project.stakeholders })
  }

  items.push(
    { label: 'Prepared on', value: formatDocDate(generatedAt, settings.dateFormat) },
    { label: 'Brief completeness', value: `${readiness.score}%` },
  )

  return items
}

/** Cover, document information and contents all precede the numbered body. */
function countFrontMatterPages(options: ExportOptions, sectionCount: number): number {
  let count = 0
  if (options.includeCover) count += 1
  if (options.includeDocumentInfo) count += 1
  if (options.includeToc) count += Math.max(1, Math.ceil(sectionCount / TOC_ENTRIES_PER_PAGE))
  return count
}

/* -------------------------------------------------------------------------- */
/* Body sections                                                               */
/* -------------------------------------------------------------------------- */

function buildBriefSection(
  definition: SectionDefinition,
  project: Project,
  pages: ProjectPage[],
  readiness: ReadinessReport,
  context: FormatContext,
  options: ExportOptions,
): DocumentSection[] | null {
  const completion = readiness.sections.find((entry) => entry.sectionId === definition.id)
  const values = withDefaults(definition.fields, project.brief[definition.id])

  // A section may describe its own document shape; otherwise the field
  // descriptors drive the rendering.
  const blocks = definition.documentBlocks
    ? definition.documentBlocks({
        values,
        project,
        pages,
        dateFormat: context.dateFormat,
        includeEmpty: context.includeEmpty,
      })
    : fieldsToBlocks(definition.fields, values, context)

  if (definition.id === 'page-requirements') {
    return buildPageRequirements(definition, pages, blocks, completion?.percent, context, options)
  }

  if (definition.id === 'approvals') {
    blocks.push(...approvalSignatureBlocks(project))
  }

  const built = makeSection({
    id: definition.id,
    number: '',
    title: definition.title,
    description: definition.description,
    completion: completion?.percent,
    blocks: blocks.length > 0 ? blocks : [{ type: 'empty', text: 'Not completed.' }],
  })

  if (built.isEmpty && !options.includeEmptySections) return null
  return [built]
}

/**
 * Page Requirements is the one section with a nested shape: an inventory table
 * of every page, then one subsection per page.
 */
function buildPageRequirements(
  definition: SectionDefinition,
  pages: ProjectPage[],
  baseBlocks: DocBlock[],
  completion: number | undefined,
  context: FormatContext,
  options: ExportOptions,
): DocumentSection[] | null {
  const blocks = [...baseBlocks]

  if (pages.length > 0) {
    blocks.push(
      table(
        [
          { header: '#', width: 0.4, align: 'right' },
          { header: 'Page', width: 1.6 },
          { header: 'Purpose', width: 3 },
          { header: 'Primary CTA', width: 1.4 },
          { header: 'Detail', width: 0.7, align: 'right' },
        ],
        pages.map((page, index) => [
          String(index + 1),
          page.name || 'Untitled page',
          page.purpose || '—',
          page.primaryCta || '—',
          `${pageCompletion(page)}%`,
        ]),
        'Page inventory',
      ),
    )
  } else {
    blocks.push({ type: 'empty', text: 'No pages have been defined for this project.' })
  }

  const parent = makeSection({
    id: definition.id,
    number: '',
    title: definition.title,
    description: definition.description,
    completion,
    blocks,
  })

  if (parent.isEmpty && pages.length === 0 && !options.includeEmptySections) return null

  const pageSections = pages.map((page, index) =>
    makeSection({
      id: `page-${page.id}`,
      number: '',
      title: page.name || `Page ${index + 1}`,
      level: 2,
      completion: pageCompletion(page),
      blocks: buildPageBlocks(page, context),
    }),
  )

  return [parent, ...pageSections]
}

/** Field order for a single page — mirrors the page drawer. */
const PAGE_FIELDS: Array<{
  key: keyof ProjectPage
  label: string
}> = [
  { key: 'purpose', label: 'Purpose' },
  { key: 'summary', label: 'Summary' },
  { key: 'businessGoal', label: 'Business goal' },
  { key: 'audience', label: 'Audience' },
  { key: 'primaryCta', label: 'Primary CTA' },
  { key: 'secondaryCta', label: 'Secondary CTA' },
  { key: 'contentRequirements', label: 'Content requirements' },
  { key: 'requiredComponents', label: 'Components' },
  { key: 'dependencies', label: 'Dependencies' },
  { key: 'seoNotes', label: 'SEO' },
  { key: 'accessibilityNotes', label: 'Accessibility' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'internalNotes', label: 'Notes' },
]

function buildPageBlocks(page: ProjectPage, context: FormatContext): DocBlock[] {
  const items: DocFieldItem[] = []

  for (const { key, label } of PAGE_FIELDS) {
    const raw = page[key]

    if (Array.isArray(raw)) {
      const list = stringsToBullets(raw)
      if (list) items.push({ label, value: '', bullets: list })
      else if (context.includeEmpty) items.push({ label, value: 'Not provided', empty: true })
      continue
    }

    const value = typeof raw === 'string' ? raw.trim() : ''
    if (value) items.push({ label, value })
    else if (context.includeEmpty) items.push({ label, value: 'Not provided', empty: true })
  }

  if (items.length === 0) {
    return [{ type: 'empty', text: 'This page has no details recorded yet.' }]
  }

  return [fieldsBlock(items)]
}

/** A signature block gives the approvals section somewhere to be signed. */
function approvalSignatureBlocks(project: Project): DocBlock[] {
  const names =
    project.stakeholders.length > 0 ? project.stakeholders : ['Client representative', 'Project lead']

  return [
    heading('Sign-off', 3),
    paragraph(
      'By signing below, each party confirms that the requirements set out in this document are complete and accurate as of the date of signature.',
      'muted',
    ),
    table(
      [
        { header: 'Name', width: 1.4 },
        { header: 'Role', width: 1.2 },
        { header: 'Signature', width: 1.6 },
        { header: 'Date', width: 0.9 },
      ],
      names.map((name) => [name, '', '', '']),
      'Approval matrix',
    ),
  ]
}

/* -------------------------------------------------------------------------- */
/* Appendix                                                                    */
/* -------------------------------------------------------------------------- */

function buildAppendix(
  project: Project,
  readiness: ReadinessReport,
  context: FormatContext,
): DocumentSection {
  const outstanding = readiness.sections.filter(
    (entry) => entry.missingRequired.length > 0 || entry.missingOptional.length > 0,
  )

  const outOfScope = project.brief['project-overview']?.outOfScope
  const futureScope = Array.isArray(outOfScope)
    ? (outOfScope as string[]).filter((item) => typeof item === 'string' && item.trim())
    : []

  const blocks = compact([
    pageBreak,
    paragraph(
      'Supporting detail generated from the state of the brief at the time of export.',
      'muted',
    ),
    heading('A. Completeness by section', 3),
    table(
      [
        { header: 'Section', width: 2.4 },
        { header: 'Complete', width: 0.8, align: 'right' },
        { header: 'Outstanding answers', width: 3 },
      ],
      readiness.sections.map((entry) => [
        entry.title,
        `${entry.percent}%`,
        summariseOutstanding(entry.missingRequired, entry.missingOptional),
      ]),
      'Completeness by section',
    ),
    outstanding.length > 0 ? heading('B. Outstanding required answers', 3) : null,
    outstanding.length > 0 ? outstandingList(outstanding) : null,
    readiness.recommendations.length > 0 ? heading('C. Recommendations', 3) : null,
    readiness.recommendations.length > 0
      ? bulletList(readiness.recommendations.map((item) => item.message))
      : null,
    futureScope.length > 0
      ? callout(
          'future',
          `Explicitly out of scope for this release: ${futureScope.join('; ')}.`,
          'Future scope',
        )
      : null,
  ])

  return makeSection({
    id: 'appendix',
    number: '',
    title: 'Appendix',
    description: 'Completeness, outstanding answers and recommendations.',
    blocks: context.includeEmpty || blocks.length > 0 ? blocks : [{ type: 'empty', text: '—' }],
  })
}

function summariseOutstanding(required: string[], optional: string[]): string {
  if (required.length === 0 && optional.length === 0) return 'None'
  const parts: string[] = []
  if (required.length > 0) parts.push(`${required.length} required`)
  if (optional.length > 0) parts.push(`${optional.length} optional`)
  return parts.join(', ')
}

function outstandingList(
  entries: ReadinessReport['sections'],
): DocBlock {
  const items: DocText[] = entries
    .filter((entry) => entry.missingRequired.length > 0)
    .map((entry) => `${entry.title}: ${entry.missingRequired.join(', ')}`)

  return items.length > 0
    ? bulletList(items)
    : paragraph('Every required answer has been provided.', 'muted')
}

/* -------------------------------------------------------------------------- */
/* Numbering                                                                   */
/* -------------------------------------------------------------------------- */

/** Top-level sections number 1…n; subsections inherit their parent's number. */
function numberSections(sections: DocumentSection[]): void {
  let top = 0
  let sub = 0

  for (const section of sections) {
    if (section.level === 1) {
      top += 1
      sub = 0
      section.number = String(top)
    } else {
      sub += 1
      section.number = `${top}.${sub}`
    }
  }
}
