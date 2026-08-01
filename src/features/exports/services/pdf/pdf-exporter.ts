import {
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  StandardFonts,
  type PDFPage,
  type PDFRef,
} from 'pdf-lib'
import type { DocumentModel } from '@/types/document'
import { geometryFor } from '@/features/documents/lib/page-metrics'
import { PdfWriter, type SectionAnchor, type LinkTarget, type PdfFonts } from './pdf-layout'

/**
 * PDF export.
 *
 * Runs the layout engine twice. The first pass is a measurement run: nothing is
 * drawn, but it establishes which page every section lands on and how many
 * pages there are in total. The second pass draws for real with those numbers,
 * so the contents page and the "page x of y" footers are correct rather than
 * approximate.
 *
 * Typography is Helvetica rather than the app's Manrope: embedding a webfont
 * would mean shipping a subsetting library and a font file for every export,
 * and the standard fonts need neither.
 */

export async function exportPdf(model: DocumentModel): Promise<Blob> {
  const measured = await layout(model, { dry: true })

  const pageNumbers = new Map<string, number>()
  for (const anchor of measured.anchors) {
    pageNumbers.set(anchor.sectionId, anchor.pageIndex + 1)
  }

  const final = await layout(model, {
    dry: false,
    totalPages: measured.totalPages,
    pageNumbers,
  })

  attachLinks(final.document, final.pages, final.links, final.anchors)
  addOutline(final.document, final.anchors, final.pages)

  applyMetadata(final.document, model)

  const bytes = await final.document.save()
  // A fresh ArrayBuffer keeps the Blob independent of pdf-lib's internal buffer.
  return new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/pdf' })
}

/* -------------------------------------------------------------------------- */
/* Layout passes                                                               */
/* -------------------------------------------------------------------------- */

interface LayoutResult {
  document: PDFDocument
  pages: PDFPage[]
  anchors: SectionAnchor[]
  links: LinkTarget[]
  totalPages: number
}

async function layout(
  model: DocumentModel,
  options: { dry: boolean; totalPages?: number; pageNumbers?: Map<string, number> },
): Promise<LayoutResult> {
  const document = await PDFDocument.create()
  const fonts = await embedFonts(document)

  const geometry = geometryFor(model.settings.pageSize, model.settings.margins, {
    headers: model.options.headers,
    footers: model.options.footers,
  })

  const writer = new PdfWriter({
    geometry,
    fonts,
    model,
    dry: options.dry,
    totalPages: options.totalPages,
    pageNumbers: options.pageNumbers,
    addPage: () => document.addPage([geometry.page.width, geometry.page.height]),
  })

  if (model.options.includeCover) writer.cover()
  if (model.options.includeDocumentInfo) writer.documentInformation()
  if (model.options.includeToc) writer.contents()
  writer.body()

  return {
    document,
    pages: writer.pages,
    anchors: writer.anchors,
    links: writer.links,
    totalPages: writer.pageCount,
  }
}

async function embedFonts(document: PDFDocument): Promise<PdfFonts> {
  const [regular, bold, italic, boldItalic] = await Promise.all([
    document.embedFont(StandardFonts.Helvetica),
    document.embedFont(StandardFonts.HelveticaBold),
    document.embedFont(StandardFonts.HelveticaOblique),
    document.embedFont(StandardFonts.HelveticaBoldOblique),
  ])
  return { regular, bold, italic, boldItalic }
}

function applyMetadata(document: PDFDocument, model: DocumentModel): void {
  document.setTitle(model.meta.documentTitle)
  document.setSubject(model.cover.subtitle)
  document.setAuthor(model.meta.preparedBy || model.meta.company || 'ReqStudio')
  document.setProducer('ReqStudio')
  document.setCreator('ReqStudio')
  document.setCreationDate(new Date(model.meta.generatedAt))
  document.setModificationDate(new Date(model.meta.generatedAt))
  document.setKeywords([model.meta.projectName, model.cover.client, model.meta.version])
}

/* -------------------------------------------------------------------------- */
/* Clickable contents                                                          */
/* -------------------------------------------------------------------------- */

/** A destination that scrolls the target section to the top of the window. */
function destinationFor(page: PDFPage, y: number) {
  return [page.ref, PDFName.of('XYZ'), PDFNumber.of(0), PDFNumber.of(y), PDFNumber.of(0)]
}

function attachLinks(
  document: PDFDocument,
  pages: PDFPage[],
  links: LinkTarget[],
  anchors: SectionAnchor[],
): void {
  const context = document.context
  const anchorById = new Map(anchors.map((anchor) => [anchor.sectionId, anchor]))
  const byPage = new Map<number, PDFRef[]>()

  for (const link of links) {
    const anchor = anchorById.get(link.sectionId)
    const target = anchor ? pages[anchor.pageIndex] : undefined
    if (!anchor || !target) continue

    const annotation = context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: link.rect,
      Border: [0, 0, 0],
      // Print + NoZoom, so the link does not render a visible box.
      F: 4,
      A: context.obj({
        Type: 'Action',
        S: 'GoTo',
        D: destinationFor(target, anchor.y),
      }),
    })

    const list = byPage.get(link.pageIndex) ?? []
    list.push(context.register(annotation))
    byPage.set(link.pageIndex, list)
  }

  for (const [pageIndex, refs] of byPage) {
    const page = pages[pageIndex]
    if (page) page.node.set(PDFName.of('Annots'), context.obj(refs))
  }
}

/* -------------------------------------------------------------------------- */
/* Bookmarks                                                                   */
/* -------------------------------------------------------------------------- */

interface OutlineNode {
  anchor: SectionAnchor
  ref: PDFRef
  children: OutlineNode[]
}

/**
 * Document outline (the bookmark pane in most readers).
 *
 * Built as a linked tree of dictionaries, which is what the PDF specification
 * asks for — every item carries its siblings and its parent.
 */
function addOutline(document: PDFDocument, anchors: SectionAnchor[], pages: PDFPage[]): void {
  const usable = anchors.filter((anchor) => pages[anchor.pageIndex] !== undefined)
  if (usable.length === 0) return

  const context = document.context
  const roots: OutlineNode[] = []

  for (const anchor of usable) {
    const node: OutlineNode = { anchor, ref: context.nextRef(), children: [] }
    const parent = roots[roots.length - 1]

    if (anchor.level === 2 && parent) parent.children.push(node)
    else roots.push(node)
  }

  const outlinesRef = context.nextRef()

  const writeLevel = (nodes: OutlineNode[], parentRef: PDFRef): number => {
    let count = 0

    for (const [index, node] of nodes.entries()) {
      const page = pages[node.anchor.pageIndex]
      if (!page) continue

      const descendants = node.children.length > 0 ? writeLevel(node.children, node.ref) : 0
      const title = node.anchor.number
        ? `${node.anchor.number}. ${node.anchor.title}`
        : node.anchor.title

      const previous = nodes[index - 1]
      const next = nodes[index + 1]

      context.assign(
        node.ref,
        context.obj({
          Title: PDFHexString.fromText(title),
          Parent: parentRef,
          Dest: destinationFor(page, node.anchor.y),
          ...(previous ? { Prev: previous.ref } : {}),
          ...(next ? { Next: next.ref } : {}),
          ...(node.children.length > 0
            ? {
                First: node.children[0]!.ref,
                Last: node.children[node.children.length - 1]!.ref,
                // Negative keeps sub-sections collapsed when the file opens.
                Count: PDFNumber.of(-descendants),
              }
            : {}),
        }),
      )
      count += 1 + descendants
    }

    return count
  }

  const total = writeLevel(roots, outlinesRef)
  if (total === 0) return

  context.assign(
    outlinesRef,
    context.obj({
      Type: 'Outlines',
      First: roots[0]!.ref,
      Last: roots[roots.length - 1]!.ref,
      Count: PDFNumber.of(roots.length),
    }),
  )

  document.catalog.set(PDFName.of('Outlines'), outlinesRef)
  document.catalog.set(PDFName.of('PageMode'), PDFName.of('UseOutlines'))
}
