import { create } from 'zustand'

import { type Orientation, DEFAULT_ORIENTATION } from '@/lib/crop'
import { type DateFormat, DEFAULT_DATE_FORMAT } from '@/lib/date'
import { DEFAULT_CAPTION_FONT_ID } from '@/lib/fonts'
import { type LocationDetail } from '@/lib/geocode'
import {
  DEFAULT_BORDER_COLOR,
  DEFAULT_BORDER_WIDTH,
  DEFAULT_PAPER_SIZE_ID,
} from '@/lib/layout'

export const MIN_PER_ROW = 2
export const MAX_PER_ROW = 5

export type CaptionLocation = LocationDetail

/** The persistable subset of settings (no action functions). */
export interface SettingsSnapshot {
  borderColor: string
  borderWidth: number
  frameShape: Orientation
  captionFontId: string
  paperSizeId: string
  polaroidsPerRow: number
  showCutMarks: boolean
  captionLocation: CaptionLocation
  dateFormat: DateFormat
  showCameraLine: boolean
  showCaptions: boolean
}

/** Extracts the persistable settings (no action functions) from store state. */
export function settingsSnapshot(state: SettingsState): SettingsSnapshot {
  return PERSISTED_SETTINGS_KEYS.reduce(
    (snapshot, key) => ({ ...snapshot, [key]: state[key] }),
    {} as SettingsSnapshot,
  )
}

export const PERSISTED_SETTINGS_KEYS: (keyof SettingsSnapshot)[] = [
  'borderColor',
  'borderWidth',
  'frameShape',
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
  /** Polaroid border colour (hex) — the card the photo sits on. */
  borderColor: string
  setBorderColor: (hex: string) => void
  /** Border thickness as a fraction of the frame width (sides/top). */
  borderWidth: number
  setBorderWidth: (ratio: number) => void
  /** Frame shape for the whole sheet — the photo covers a box of this aspect. */
  frameShape: Orientation
  setFrameShape: (shape: Orientation) => void
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
  borderColor: DEFAULT_BORDER_COLOR,
  setBorderColor: (hex) => set({ borderColor: hex }),
  borderWidth: DEFAULT_BORDER_WIDTH,
  setBorderWidth: (ratio) => set({ borderWidth: ratio }),
  frameShape: DEFAULT_ORIENTATION,
  setFrameShape: (shape) => set({ frameShape: shape }),
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
