import { create } from 'zustand'

import { DEFAULT_CAPTION_FONT_ID } from '@/lib/fonts'

export const MIN_FRAME_PADDING = 6
export const MAX_FRAME_PADDING = 28

interface SettingsState {
  /** White polaroid border width in px (sides/top); the bottom is thicker. */
  framePadding: number
  setFramePadding: (px: number) => void
  captionFontId: string
  setCaptionFont: (id: string) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  framePadding: 14,
  setFramePadding: (px) => set({ framePadding: px }),
  captionFontId: DEFAULT_CAPTION_FONT_ID,
  setCaptionFont: (id) => set({ captionFontId: id }),
}))
