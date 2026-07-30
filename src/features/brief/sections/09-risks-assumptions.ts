import { ShieldAlert } from 'lucide-react'
import type { SectionDefinition } from '@/types/section'

export const risksAssumptionsSection: SectionDefinition = {
  id: 'risks-assumptions',
  order: 9,
  title: 'Risks & Assumptions',
  description: 'What could derail the project, and what everyone is quietly taking for granted.',
  icon: ShieldAlert,
  fields: [
    {
      kind: 'repeater',
      name: 'risks',
      label: 'Risks',
      itemLabel: 'Risk',
      titleField: 'risk',
      required: true,
      minItems: 1,
      span: 2,
      fields: [
        { kind: 'text', name: 'risk', label: 'Risk', required: true, span: 2 },
        {
          kind: 'select',
          name: 'likelihood',
          label: 'Likelihood',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ],
        },
        {
          kind: 'select',
          name: 'impact',
          label: 'Impact',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' },
          ],
        },
        { kind: 'textarea', name: 'mitigation', label: 'Mitigation', rows: 2, span: 2 },
        { kind: 'text', name: 'owner', label: 'Owner' },
        {
          kind: 'select',
          name: 'status',
          label: 'Status',
          options: [
            { value: 'open', label: 'Open' },
            { value: 'monitoring', label: 'Monitoring' },
            { value: 'mitigated', label: 'Mitigated' },
            { value: 'accepted', label: 'Accepted' },
          ],
        },
      ],
    },
    {
      kind: 'list',
      name: 'assumptions',
      label: 'Assumptions',
      itemLabel: 'Assumption',
      placeholder: 'e.g. Client provides final copy by 14 March',
      required: true,
      span: 2,
    },
    {
      kind: 'list',
      name: 'dependencies',
      label: 'Dependencies',
      itemLabel: 'Dependency',
      placeholder: 'e.g. Brand refresh signed off before design starts',
      span: 2,
    },
    {
      kind: 'textarea',
      name: 'constraints',
      label: 'Constraints',
      placeholder: 'Fixed budget, immovable launch date, team availability.',
      rows: 3,
      span: 2,
    },
    {
      kind: 'textarea',
      name: 'openQuestions',
      label: 'Open questions',
      placeholder: 'Anything still unanswered at the time of writing.',
      rows: 3,
      span: 2,
    },
  ],
}
