import { create } from 'zustand'

export const MIN_FRAME_PADDING = 6
export const MAX_FRAME_PADDING = 28

interface SettingsState {
  /** White polaroid border width in px (sides/top); the bottom is thicker. */
  framePadding: number
  setFramePadding: (px: number) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  framePadding: 14,
  setFramePadding: (px) => set({ framePadding: px }),
}))
