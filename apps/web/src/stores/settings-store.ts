import { create } from 'zustand'

import { type DateFormat, DEFAULT_DATE_FORMAT } from '@/lib/date'
import { DEFAULT_CAPTION_FONT_ID } from '@/lib/fonts'
import { DEFAULT_PAPER_SIZE_ID } from '@/lib/layout'

export const MIN_FRAME_PADDING = 6
export const MAX_FRAME_PADDING = 28

export const MIN_PER_ROW = 2
export const MAX_PER_ROW = 5

export type CaptionLocation = 'city' | 'country'

/** The persistable subset of settings (no action functions). */
export interface SettingsSnapshot {
  framePadding: number
  captionFontId: string
  paperSizeId: string
  polaroidsPerRow: number
  showCutMarks: boolean
  captionLocation: CaptionLocation
  dateFormat: DateFormat
  showCameraLine: boolean
  showCaptions: boolean
}

export const PERSISTED_SETTINGS_KEYS: (keyof SettingsSnapshot)[] = [
  'framePadding',
  'captionFontId',
  'paperSizeId',
  'polaroidsPerRow',
  'showCutMarks',
  'captionLocation',
  'dateFormat',
  'showCameraLine',
  'showCaptions',
]

interface SettingsState {
  /** White polaroid border width in px (sides/top); the bottom is thicker. */
  framePadding: number
  setFramePadding: (px: number) => void
  captionFontId: string
  setCaptionFont: (id: string) => void
  /** Selected print stock (A4, Letter, 4×6, …). */
  paperSizeId: string
  setPaperSize: (id: string) => void
  /** Polaroids per row on the sheet. */
  polaroidsPerRow: number
  setPolaroidsPerRow: (count: number) => void
  /** Show crop/cut guides for trimming after printing. */
  showCutMarks: boolean
  setShowCutMarks: (show: boolean) => void
  /** Whether the location caption shows the city or the country. */
  captionLocation: CaptionLocation
  setCaptionLocation: (location: CaptionLocation) => void
  /** How the auto date caption is formatted. */
  dateFormat: DateFormat
  setDateFormat: (format: DateFormat) => void
  /** Whether to show the camera/lens/exposure line under captions. */
  showCameraLine: boolean
  setShowCameraLine: (show: boolean) => void
  /** Whether captions are shown at all. */
  showCaptions: boolean
  setShowCaptions: (show: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  framePadding: 14,
  setFramePadding: (px) => set({ framePadding: px }),
  captionFontId: DEFAULT_CAPTION_FONT_ID,
  setCaptionFont: (id) => set({ captionFontId: id }),
  paperSizeId: DEFAULT_PAPER_SIZE_ID,
  setPaperSize: (id) => set({ paperSizeId: id }),
  polaroidsPerRow: 3,
  setPolaroidsPerRow: (count) => set({ polaroidsPerRow: count }),
  showCutMarks: true,
  setShowCutMarks: (show) => set({ showCutMarks: show }),
  captionLocation: 'city',
  setCaptionLocation: (location) => set({ captionLocation: location }),
  dateFormat: DEFAULT_DATE_FORMAT,
  setDateFormat: (format) => set({ dateFormat: format }),
  showCameraLine: false,
  setShowCameraLine: (show) => set({ showCameraLine: show }),
  showCaptions: true,
  setShowCaptions: (show) => set({ showCaptions: show }),
}))
