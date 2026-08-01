import type { BaseEntity } from './entity'

/**
 * The document model.
 *
 * A brief is compiled once into this structure, and every surface — the Preview
 * tab, PDF, Word, Markdown and HTML — renders from it. Renderers never read
 * `Project`, `ProjectPage` or field descriptors directly, which is what keeps
 * four exporters from drifting apart and lets a future format (JSON, Confluence,
 * Notion, AI prompt) be added by writing one renderer and nothing else.
 */

/* -------------------------------------------------------------------------- */
/* Inline text                                                                 */
/* -------------------------------------------------------------------------- */

export interface DocSpan {
  text: string
  bold?: boolean
  italic?: boolean
  /** Rendered as a link where the format supports it, plain text elsewhere. */
  href?: string
}

/** Plain strings are the common case; spans are used where emphasis matters. */
export type DocText = string | DocSpan[]

/* -------------------------------------------------------------------------- */
/* Blocks                                                                      */
/* -------------------------------------------------------------------------- */

export const CALLOUT_TONES = ['info', 'success', 'warning', 'risk', 'future'] as const
export type CalloutTone = (typeof CALLOUT_TONES)[number]

export type TableAlign = 'left' | 'right' | 'center'

export interface DocTableColumn {
  header: string
  /** Relative width. Columns share the content width in proportion. */
  width?: number
  align?: TableAlign
}

export interface DocHeadingBlock {
  type: 'heading'
  /** 3 and 4 are sub-headings inside a section; 1 and 2 are section titles. */
  level: 3 | 4
  text: string
}

export interface DocParagraphBlock {
  type: 'paragraph'
  text: DocText
  /** `lead` is the larger opening paragraph; `muted` is secondary commentary. */
  variant?: 'body' | 'lead' | 'muted'
}

export interface DocListBlock {
  type: 'list'
  ordered: boolean
  items: DocText[]
}

/** Label/value pairs — the workhorse for rendering answered fields. */
export interface DocFieldListBlock {
  type: 'fields'
  items: DocFieldItem[]
}

export interface DocFieldItem {
  label: string
  /** Ignored when `bullets` is present. */
  value: DocText
  /** Renders the value as a bullet list instead of a single line. */
  bullets?: DocText[]
  /** True when the field was left blank and is only shown by request. */
  empty?: boolean
}

export interface DocTableBlock {
  type: 'table'
  caption?: string
  columns: DocTableColumn[]
  rows: DocText[][]
}

export interface DocCalloutBlock {
  type: 'callout'
  tone: CalloutTone
  title?: string
  text: DocText
}

export interface DocDividerBlock {
  type: 'divider'
}

export interface DocPageBreakBlock {
  type: 'pageBreak'
}

/** Placeholder shown where a section or page has nothing recorded. */
export interface DocEmptyBlock {
  type: 'empty'
  text: string
}

export type DocBlock =
  | DocHeadingBlock
  | DocParagraphBlock
  | DocListBlock
  | DocFieldListBlock
  | DocTableBlock
  | DocCalloutBlock
  | DocDividerBlock
  | DocPageBreakBlock
  | DocEmptyBlock

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

export interface DocumentSection {
  /** Anchor id, unique within the document. */
  id: string
  /** Display numbering: "1", "5.1". */
  number: string
  title: string
  /** 1 is a top-level section, 2 a subsection (one page, for example). */
  level: 1 | 2
  /** Short line under the title in the preview; omitted from exports' body. */
  description?: string
  blocks: DocBlock[]
  /** 0–100 where the source section tracks completion. */
  completion?: number
  /** True when the section holds no user content and is only shown by request. */
  isEmpty: boolean
  /** Estimated 1-based page the section starts on. Filled by the paginator. */
  page: number
}

/* -------------------------------------------------------------------------- */
/* Cover and metadata                                                          */
/* -------------------------------------------------------------------------- */

export interface DocumentCover {
  title: string
  subtitle: string
  projectName: string
  client: string
  organisation: string
  projectType: string
  designer: string
  preparedDate: string
  version: string
  status: string
  /** Initials rendered into the logo placeholder block. */
  logoText: string
}

export interface DocumentMeta {
  documentTitle: string
  projectName: string
  version: string
  company: string
  preparedBy: string
  approvedBy: string
  footerText: string
  generatedAt: string
  generatedDate: string
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                  */
/* -------------------------------------------------------------------------- */

export interface DocumentStatistics {
  sections: number
  /** Sections with at least one field answered. */
  completedSections: number
  pages: number
  projectPages: number
  words: number
  characters: number
  tables: number
  completion: number
  generatedAt: string
}

/* -------------------------------------------------------------------------- */
/* The compiled document                                                       */
/* -------------------------------------------------------------------------- */

export interface DocumentModel {
  meta: DocumentMeta
  cover: DocumentCover
  /** The document-information block that follows the cover. */
  documentInfo: DocFieldItem[]
  sections: DocumentSection[]
  statistics: DocumentStatistics
  settings: DocumentSettings
  options: ExportOptions
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

export const PAGE_SIZES = ['a4', 'letter'] as const
export type PageSize = (typeof PAGE_SIZES)[number]

export const MARGIN_PRESETS = ['narrow', 'normal', 'wide'] as const
export type MarginPreset = (typeof MARGIN_PRESETS)[number]

export const DATE_FORMATS = ['d MMM yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'] as const
export type DateFormatPattern = (typeof DATE_FORMATS)[number]

export const DOCUMENT_THEMES = ['light', 'print'] as const
export type DocumentTheme = (typeof DOCUMENT_THEMES)[number]

/** Author-facing document identity. Persisted per project. */
export interface DocumentSettings {
  documentTitle: string
  version: string
  company: string
  preparedBy: string
  approvedBy: string
  footerText: string
  logoText: string
  dateFormat: DateFormatPattern
  pageSize: PageSize
  margins: MarginPreset
  theme: DocumentTheme
}

/** What goes into the generated file. Persisted per project alongside settings. */
export interface ExportOptions {
  includeCover: boolean
  includeDocumentInfo: boolean
  includeToc: boolean
  includeExecutiveSummary: boolean
  includeAppendix: boolean
  includeApprovals: boolean
  includeEmptySections: boolean
  pageNumbers: boolean
  headers: boolean
  footers: boolean
}

/** Persisted document configuration for one project. */
export interface ProjectDocument extends BaseEntity {
  projectId: string
  settings: DocumentSettings
  options: ExportOptions
  /** Bumped on every successful export. */
  version: string
  lastGeneratedAt: string | null
}

/* -------------------------------------------------------------------------- */
/* Exports                                                                     */
/* -------------------------------------------------------------------------- */

export const EXPORT_FORMATS = ['pdf', 'docx', 'markdown', 'html'] as const
export type ExportFormatId = (typeof EXPORT_FORMATS)[number]

/** One row in the download history. */
export interface ExportRecord extends BaseEntity {
  projectId: string
  format: ExportFormatId | 'bundle'
  fileName: string
  version: string
  /** Bytes. */
  size: number
  documentTitle: string
  pages: number
  words: number
}
