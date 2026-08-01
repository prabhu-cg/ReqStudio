import { LayoutTemplate } from 'lucide-react'
import type { FieldDef } from '@/types/field'
import type { SectionDefinition } from '@/types/section'
import { scoreFields } from '@/lib/fields/completion'
import { pageCompletion } from '../../pages/lib/page-completion'
import { PageRequirementsPane } from '../../pages/components/page-requirements-pane'

const fields: readonly FieldDef[] = [
  {
    kind: 'list',
    name: 'pageTemplates',
    label: 'Page templates',
    itemLabel: 'Template',
    placeholder: 'e.g. Article detail, Product listing',
    help: 'Reusable layouts the individual pages are built from.',
    span: 2,
  },
  {
    kind: 'textarea',
    name: 'notes',
    label: 'Page-level notes',
    placeholder: 'Conventions that apply across every page.',
    rows: 3,
    span: 2,
  },
]

/** Having at least one page is worth as much as four ordinary required fields. */
const PAGES_EXIST_WEIGHT = 4
const PER_PAGE_WEIGHT = 2
const PAGE_QUALITY_THRESHOLD = 60

export const pageRequirementsSection: SectionDefinition = {
  id: 'page-requirements',
  order: 5,
  title: 'Page Requirements',
  description: 'Every page in the build, with its purpose, calls to action and content needs.',
  icon: LayoutTemplate,
  weight: 1.4,
  fields,
  pane: PageRequirementsPane,
  completion: ({ values, pages }) => {
    const base = scoreFields(fields, values)

    let completed = base.completed + (pages.length > 0 ? PAGES_EXIST_WEIGHT : 0)
    let total = base.total + PAGES_EXIST_WEIGHT

    const missingRequired = [...base.missingRequired]
    const missingOptional = [...base.missingOptional]

    if (pages.length === 0) missingRequired.push('At least one page')

    for (const page of pages) {
      const percent = pageCompletion(page)
      total += PER_PAGE_WEIGHT
      completed += (PER_PAGE_WEIGHT * percent) / 100
      if (percent < PAGE_QUALITY_THRESHOLD) {
        missingOptional.push(`Page details: ${page.name || 'Untitled page'}`)
      }
    }

    return { completed, total, missingRequired, missingOptional }
  },
}
