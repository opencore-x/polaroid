import { create } from 'zustand'

import { DEFAULT_CAPTION_FONT_ID } from '@/lib/fonts'

export const MIN_FRAME_PADDING = 6
export const MAX_FRAME_PADDING = 28

export const MIN_PER_ROW = 2
export const MAX_PER_ROW = 5

interface SettingsState {
  /** White polaroid border width in px (sides/top); the bottom is thicker. */
  framePadding: number
  setFramePadding: (px: number) => void
  captionFontId: string
  setCaptionFont: (id: string) => void
  /** Polaroids per row on the A4 sheet. */
  polaroidsPerRow: number
  setPolaroidsPerRow: (count: number) => void
  /** Show crop/cut guides for trimming after printing. */
  showCutMarks: boolean
  setShowCutMarks: (show: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  framePadding: 14,
  setFramePadding: (px) => set({ framePadding: px }),
  captionFontId: DEFAULT_CAPTION_FONT_ID,
  setCaptionFont: (id) => set({ captionFontId: id }),
  polaroidsPerRow: 3,
  setPolaroidsPerRow: (count) => set({ polaroidsPerRow: count }),
  showCutMarks: true,
  setShowCutMarks: (show) => set({ showCutMarks: show }),
}))
