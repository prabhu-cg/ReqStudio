import { useCallback, useEffect, useRef } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { useSettingsStore } from '@/stores/settings-store'

export interface UseAutosaveOptions<T> {
  /** The value to persist. Compared structurally, so inline objects are fine. */
  value: T
  save: (value: T) => Promise<void>
  /** Disables autosave for this form (Settings can also disable it globally). */
  enabled?: boolean
  /** Overrides the user's configured debounce window. */
  delay?: number
  /** Skips saving while the form is invalid in a way that must not be stored. */
  canSave?: (value: T) => boolean
}

/**
 * Debounced autosave.
 *
 * There is no Save button anywhere in ReqStudio: every change is written to
 * IndexedDB after a short pause, and pending writes are flushed when the form
 * unmounts or the tab is hidden so navigating away never loses work.
 */
export function useAutosave<T>({
  value,
  save,
  enabled = true,
  delay,
  canSave,
}: UseAutosaveOptions<T>) {
  const autosaveEnabled = useSettingsStore((state) => state.autosaveEnabled)
  const configuredDelay = useSettingsStore((state) => state.autosaveDelay)
  const setSaveStatus = useUIStore((state) => state.setSaveStatus)

  const active = enabled && autosaveEnabled
  const wait = delay ?? configuredDelay

  const valueRef = useRef(value)
  const saveRef = useRef(save)
  const canSaveRef = useRef(canSave)
  const lastSavedRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlightRef = useRef(false)

  // Keep the latest inputs available to the debounced writer without making the
  // writer itself change identity on every keystroke.
  useEffect(() => {
    valueRef.current = value
    saveRef.current = save
    canSaveRef.current = canSave
  })

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const snapshot = valueRef.current
    const serialized = JSON.stringify(snapshot)
    if (serialized === lastSavedRef.current) return
    if (canSaveRef.current && !canSaveRef.current(snapshot)) return
    if (inFlightRef.current) return

    inFlightRef.current = true
    setSaveStatus('saving')
    try {
      await saveRef.current(snapshot)
      lastSavedRef.current = serialized
      setSaveStatus('saved')
    } catch (error) {
      console.error('[reqstudio] autosave failed', error)
      setSaveStatus('error')
    } finally {
      inFlightRef.current = false
    }
  }, [setSaveStatus])

  const serialized = JSON.stringify(value)

  // Record the initial value so mounting a form never triggers a write.
  const initialRef = useRef(serialized)
  useEffect(() => {
    lastSavedRef.current = initialRef.current
  }, [])

  useEffect(() => {
    if (!active) return
    if (serialized === lastSavedRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => void flush(), wait)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [serialized, active, wait, flush])

  // Flush on unmount and when the tab is hidden or closed.
  useEffect(() => {
    if (!active) return

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') void flush()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pagehide', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pagehide', handleVisibility)
      void flush()
    }
  }, [active, flush])

  return { flush, isAutosaveOn: active }
}
