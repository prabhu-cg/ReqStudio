/**
 * Declarative field definitions.
 *
 * Every brief section describes itself with these descriptors rather than with
 * bespoke JSX. One renderer, one validator and one completion calculator then
 * work for all sections — and for any section added in a future phase.
 */

export type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | RepeaterRow[]
  | null
  | undefined

export type RepeaterRow = Record<string, string | number | boolean | string[]>

export type SectionValues = Record<string, FieldValue>

export interface SelectOption {
  value: string
  label: string
  description?: string
}

interface FieldBase {
  /** Unique within its section (or within its repeater). */
  name: string
  label: string
  help?: string
  placeholder?: string
  required?: boolean
  /**
   * Counted towards section completion. Defaults to `true`.
   * Set `false` for optional notes that should not drag the score down.
   */
  scored?: boolean
  /** Grid width inside the section layout. */
  span?: 1 | 2
}

export interface TextFieldDef extends FieldBase {
  kind: 'text'
  maxLength?: number
}

export interface TextareaFieldDef extends FieldBase {
  kind: 'textarea'
  rows?: number
  maxLength?: number
}

export interface NumberFieldDef extends FieldBase {
  kind: 'number'
  min?: number
  max?: number
  step?: number
  suffix?: string
}

export interface DateFieldDef extends FieldBase {
  kind: 'date'
}

export interface SelectFieldDef extends FieldBase {
  kind: 'select'
  options: readonly SelectOption[]
}

export interface MultiSelectFieldDef extends FieldBase {
  kind: 'multiselect'
  options: readonly SelectOption[]
}

export interface TagsFieldDef extends FieldBase {
  kind: 'tags'
  suggestions?: readonly string[]
}

export interface ListFieldDef extends FieldBase {
  kind: 'list'
  itemLabel?: string
  minItems?: number
}

export interface SwitchFieldDef extends FieldBase {
  kind: 'switch'
}

export interface RepeaterFieldDef extends FieldBase {
  kind: 'repeater'
  itemLabel: string
  /** Field within the row used as the collapsed row title. */
  titleField: string
  fields: readonly RepeaterSubFieldDef[]
  minItems?: number
}

/** Repeaters may not nest — keeps the renderer and schema builder total. */
export type RepeaterSubFieldDef =
  | TextFieldDef
  | TextareaFieldDef
  | NumberFieldDef
  | DateFieldDef
  | SelectFieldDef
  | MultiSelectFieldDef
  | TagsFieldDef
  | ListFieldDef
  | SwitchFieldDef

export type FieldDef = RepeaterSubFieldDef | RepeaterFieldDef

export type FieldKind = FieldDef['kind']
