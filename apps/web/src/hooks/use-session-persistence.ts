import { useEffect } from 'react'

import { loadSession, savePhotos, saveSettings } from '@/lib/session'
import { usePhotoStore } from '@/stores/photo-store'
import {
  PERSISTED_SETTINGS_KEYS,
  type SettingsSnapshot,
  useSettingsStore,
} from '@/stores/settings-store'

function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: A) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

function snapshotSettings(
  state: ReturnType<typeof useSettingsStore.getState>,
): SettingsSnapshot {
  return PERSISTED_SETTINGS_KEYS.reduce((acc, key) => {
    return { ...acc, [key]: state[key] }
  }, {} as SettingsSnapshot)
}

/**
 * Hydrates the photo + settings stores from IndexedDB on first mount, then
 * write-throughs every change back. Persistence is only wired up after the
 * initial load resolves, so the empty starting state can't clobber saved work.
 */
export function useSessionPersistence(): void {
  useEffect(() => {
    let active = true
    const unsubscribers: Array<() => void> = []

    loadSession().then(({ photos, settings }) => {
      if (!active) return

      // Guard against clobbering anything the user added during the load tick.
      if (photos.length && usePhotoStore.getState().photos.length === 0) {
        usePhotoStore.setState({ photos })
      }
      if (settings) useSettingsStore.setState(settings)

      const persistPhotos = debounce(savePhotos, 300)
      const persistSettings = debounce(saveSettings, 300)
      unsubscribers.push(
        usePhotoStore.subscribe((state) => persistPhotos(state.photos)),
        useSettingsStore.subscribe((state) =>
          persistSettings(snapshotSettings(state)),
        ),
      )
    })

    return () => {
      active = false
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [])
}
