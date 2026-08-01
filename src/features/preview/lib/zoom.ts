/**
 * Preview zoom steps.
 *
 * Kept apart from the control that renders them so the component module only
 * exports components, which is what keeps fast refresh working.
 */
export const ZOOM_STEPS = [0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.5] as const

export const DEFAULT_ZOOM_INDEX = 3

export function zoomAt(index: number): number {
  return ZOOM_STEPS[index] ?? 1
}
