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
export const MIN_ROWS = 1
export const MAX_ROWS = 6
export const MIN_STRIPS_PER_ROW = 2
export const MAX_STRIPS_PER_ROW = 5

/** Sheet layout format: the card grid or photo-booth strips. */
export type SheetFormat = 'grid' | 'strip'

export type CaptionLocation = LocationDetail

/** The persistable subset of settings (no action functions). */
export interface SettingsSnapshot {
  sheetFormat: SheetFormat
  borderColor: string
  borderWidth: number
  frameShape: Orientation
  pageShapes: Orientation[]
  captionFontId: string
  paperSizeId: string
  cardsPerRow: number
  rowsPerPage: number
  stripsPerRow: number
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
  'sheetFormat',
  'borderColor',
  'borderWidth',
  'frameShape',
  'pageShapes',
  'captionFontId',
  'paperSizeId',
  'cardsPerRow',
  'rowsPerPage',
  'stripsPerRow',
  'showCutMarks',
  'captionLocation',
  'dateFormat',
  'showCameraLine',
  'showCaptions',
]

interface SettingsState {
  /** Sheet layout format: the card grid or photo-booth strips. */
  sheetFormat: SheetFormat
  setSheetFormat: (format: SheetFormat) => void
  /** Card border colour (hex) — the card the photo sits on. */
  borderColor: string
  setBorderColor: (hex: string) => void
  /** Border thickness as a fraction of the frame width (sides/top). */
  borderWidth: number
  setBorderWidth: (ratio: number) => void
  /** Default frame shape — used for any page without its own override. */
  frameShape: Orientation
  setFrameShape: (shape: Orientation) => void
  /** Per-page shape overrides, indexed by page number (sparse). */
  pageShapes: Orientation[]
  /** Override one page's shape. */
  setPageShape: (page: number, shape: Orientation) => void
  /** Apply one shape to every page and clear the per-page overrides. */
  setFrameShapeAll: (shape: Orientation) => void
  captionFontId: string
  setCaptionFont: (id: string) => void
  /** Selected print stock (A4, Letter, 4×6, …). */
  paperSizeId: string
  setPaperSize: (id: string) => void
  /** Cards per row on the sheet (grid columns). */
  cardsPerRow: number
  setCardsPerRow: (count: number) => void
  /** Grid rows per page; combined with perRow this fixes the frames per sheet. */
  rowsPerPage: number
  setRowsPerPage: (count: number) => void
  /** Photo-booth strips per row (strip format only). */
  stripsPerRow: number
  setStripsPerRow: (count: number) => void
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
  /** Apply a preset's settings in one shot, clearing per-page shape overrides. */
  applyPreset: (settings: Partial<SettingsSnapshot>) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  sheetFormat: 'grid',
  setSheetFormat: (format) => set({ sheetFormat: format }),
  borderColor: DEFAULT_BORDER_COLOR,
  setBorderColor: (hex) => set({ borderColor: hex }),
  borderWidth: DEFAULT_BORDER_WIDTH,
  setBorderWidth: (ratio) => set({ borderWidth: ratio }),
  frameShape: DEFAULT_ORIENTATION,
  setFrameShape: (shape) => set({ frameShape: shape }),
  pageShapes: [],
  setPageShape: (page, shape) =>
    set((state) => {
      const pageShapes = state.pageShapes.slice()
      pageShapes[page] = shape
      return { pageShapes }
    }),
  setFrameShapeAll: (shape) => set({ frameShape: shape, pageShapes: [] }),
  captionFontId: DEFAULT_CAPTION_FONT_ID,
  setCaptionFont: (id) => set({ captionFontId: id }),
  paperSizeId: DEFAULT_PAPER_SIZE_ID,
  setPaperSize: (id) => set({ paperSizeId: id }),
  cardsPerRow: 3,
  setCardsPerRow: (count) => set({ cardsPerRow: count }),
  rowsPerPage: 3,
  setRowsPerPage: (count) => set({ rowsPerPage: count }),
  stripsPerRow: 3,
  setStripsPerRow: (count) => set({ stripsPerRow: count }),
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
  applyPreset: (settings) => set({ ...settings, pageShapes: [] }),
}))
