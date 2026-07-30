import type { FieldDef, SectionValues } from '@/types/field'
import type { ProjectPage } from '@/types/project'
import { getSectionSchema } from '@/lib/fields/schema'
import { withDefaults } from '@/lib/fields/value'

/** The page brief — every field listed in the Page Requirements specification. */
export const pageFormFields: readonly FieldDef[] = [
  {
    kind: 'text',
    name: 'name',
    label: 'Page name',
    placeholder: 'e.g. Pricing',
    required: true,
    span: 2,
  },
  {
    kind: 'textarea',
    name: 'purpose',
    label: 'Purpose',
    placeholder: 'Why does this page exist?',
    required: true,
    rows: 2,
    span: 2,
  },
  { kind: 'text', name: 'audience', label: 'Audience', placeholder: 'Who is this page for?' },
  {
    kind: 'text',
    name: 'businessGoal',
    label: 'Business goal',
    placeholder: 'Which goal does it serve?',
  },
  {
    kind: 'textarea',
    name: 'summary',
    label: 'Summary',
    placeholder: 'What a visitor should understand within ten seconds.',
    rows: 3,
    span: 2,
  },
  {
    kind: 'text',
    name: 'primaryCta',
    label: 'Primary CTA',
    placeholder: 'e.g. Request a demo',
    required: true,
  },
  { kind: 'text', name: 'secondaryCta', label: 'Secondary CTA', placeholder: 'e.g. Download the guide' },
  {
    kind: 'list',
    name: 'contentRequirements',
    label: 'Content requirements',
    itemLabel: 'Requirement',
    placeholder: 'e.g. Three-tier pricing table',
    span: 2,
  },
  {
    kind: 'list',
    name: 'requiredComponents',
    label: 'Required components',
    itemLabel: 'Component',
    placeholder: 'e.g. Comparison table, FAQ accordion',
    span: 2,
  },
  {
    kind: 'list',
    name: 'dependencies',
    label: 'Dependencies',
    itemLabel: 'Dependency',
    placeholder: 'e.g. Final pricing sign-off from Finance',
    span: 2,
  },
  {
    kind: 'textarea',
    name: 'seoNotes',
    label: 'SEO notes',
    placeholder: 'Target keywords, title, meta description, schema.',
    rows: 2,
    span: 2,
  },
  {
    kind: 'textarea',
    name: 'accessibilityNotes',
    label: 'Accessibility notes',
    placeholder: 'Heading order, alternative text, focus order, contrast risks.',
    rows: 2,
    span: 2,
  },
  {
    kind: 'textarea',
    name: 'analytics',
    label: 'Analytics',
    placeholder: 'Events and conversions to track on this page.',
    rows: 2,
    span: 2,
  },
  {
    kind: 'textarea',
    name: 'internalNotes',
    label: 'Internal notes',
    help: 'Team-only context. Excluded from page completion scoring.',
    rows: 2,
    span: 2,
    scored: false,
  },
]

export const pageFormSchema = getSectionSchema(pageFormFields)

export const PAGE_FORM_DEFAULTS: SectionValues = withDefaults(pageFormFields, {})

export function pageToFormValues(page: ProjectPage): SectionValues {
  return withDefaults(pageFormFields, {
    name: page.name,
    purpose: page.purpose,
    audience: page.audience,
    summary: page.summary,
    businessGoal: page.businessGoal,
    primaryCta: page.primaryCta,
    secondaryCta: page.secondaryCta,
    contentRequirements: page.contentRequirements,
    requiredComponents: page.requiredComponents,
    dependencies: page.dependencies,
    seoNotes: page.seoNotes,
    accessibilityNotes: page.accessibilityNotes,
    analytics: page.analytics,
    internalNotes: page.internalNotes,
  })
}

type PagePayload = Omit<
  ProjectPage,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'revision' | 'syncState' | 'projectId' | 'order'
>

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).map((v) => v.trim()).filter(Boolean) : []
}

export function formValuesToPage(values: SectionValues): PagePayload {
  return {
    name: str(values.name),
    purpose: str(values.purpose),
    audience: str(values.audience),
    summary: str(values.summary),
    businessGoal: str(values.businessGoal),
    primaryCta: str(values.primaryCta),
    secondaryCta: str(values.secondaryCta),
    contentRequirements: list(values.contentRequirements),
    requiredComponents: list(values.requiredComponents),
    dependencies: list(values.dependencies),
    seoNotes: str(values.seoNotes),
    accessibilityNotes: str(values.accessibilityNotes),
    analytics: str(values.analytics),
    internalNotes: str(values.internalNotes),
  }
}
