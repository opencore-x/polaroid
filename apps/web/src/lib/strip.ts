import { type PaperSize, type Rect, DEFAULT_BORDER_WIDTH } from '@/lib/layout'
import { type Photo } from '@/lib/photos'

// Photo-booth strip geometry. A strip is a tall card holding four square photos
// stacked in a column with a thin border between them and a wider footer band
// to write on. The same crop math drives the on-screen preview and the PDF, so
// what you frame is what prints — exactly like the card grid.

export const PHOTOS_PER_STRIP = 4

export const STRIP = {
  /** Footer band height, as a fraction of the strip width. */
  footer: 0.22,
}

/**
 * Strip height ÷ width: a top border, four square photos separated by thin
 * borders, and the footer — all expressed as fractions of the strip width so
 * the same number drives px (preview) and pt (PDF).
 */
export function stripAspect(border = DEFAULT_BORDER_WIDTH): number {
  const photo = 1 - border * 2 // square photo height, in width units
  const gaps = PHOTOS_PER_STRIP - 1 // thin borders between the photos
  return border + PHOTOS_PER_STRIP * photo + gaps * border + STRIP.footer
}

export interface StripLayout {
  stripsPerRow: number
  /** Max photos per sheet (strips per row × photos per strip). */
  capacityPhotos: number
  stripWidthMm: number
  stripHeightMm: number
  marginMm: number
  gapMm: number
  /** Top-left position + size (mm) of the strip at `index` on the sheet. */
  rectForStrip: (index: number) => Rect
  /** The four photo boxes (mm) inside a strip, given that strip's rect. */
  photoRects: (strip: Rect) => Rect[]
}

/**
 * Lays out a single row of `stripsPerRow` strips on the sheet. Strips are tall,
 * so each is sized to the largest that fits both the column width and the full
 * page height (usually height-bound), then the row is centred horizontally with
 * any slack split evenly.
 */
export function stripLayout(
  stripsPerRow: number,
  paper: PaperSize,
  border = DEFAULT_BORDER_WIDTH,
  gapMm = 4,
): StripLayout {
  const marginMm = paper.marginMm
  const usableW = paper.widthMm - marginMm * 2
  const usableH = paper.heightMm - marginMm * 2
  const aspect = stripAspect(border)
  const widthBudget = (usableW - gapMm * (stripsPerRow - 1)) / stripsPerRow
  const stripWidthMm = Math.min(widthBudget, usableH / aspect)
  const stripHeightMm = stripWidthMm * aspect

  const rowW = stripsPerRow * stripWidthMm + gapMm * (stripsPerRow - 1)
  const originX = marginMm + (usableW - rowW) / 2
  const originY = marginMm + (usableH - stripHeightMm) / 2

  const rectForStrip = (index: number): Rect => ({
    x: originX + index * (stripWidthMm + gapMm),
    y: originY,
    width: stripWidthMm,
    height: stripHeightMm,
  })

  const photoRects = (strip: Rect): Rect[] => {
    const b = strip.width * border
    const size = strip.width - b * 2 // square photo edge
    return Array.from({ length: PHOTOS_PER_STRIP }, (_, i) => ({
      x: strip.x + b,
      y: strip.y + b + i * (size + b),
      width: size,
      height: size,
    }))
  }

  return {
    stripsPerRow,
    capacityPhotos: stripsPerRow * PHOTOS_PER_STRIP,
    stripWidthMm,
    stripHeightMm,
    marginMm,
    gapMm,
    rectForStrip,
    photoRects,
  }
}

/** Splits photos into pages of `stripsPerRow × 4` for the strip format. */
export function paginateStrips(
  photos: Photo[],
  stripsPerRow: number,
  paper: PaperSize,
  border = DEFAULT_BORDER_WIDTH,
): Photo[][] {
  if (photos.length === 0) return [[]]
  const { capacityPhotos } = stripLayout(stripsPerRow, paper, border)
  const pages: Photo[][] = []
  for (let i = 0; i < photos.length; i += capacityPhotos) {
    pages.push(photos.slice(i, i + capacityPhotos))
  }
  return pages
}

/** Chunks one page's photos into strips of up to `PHOTOS_PER_STRIP`. */
export function toStrips(photos: Photo[]): Photo[][] {
  const strips: Photo[][] = []
  for (let i = 0; i < photos.length; i += PHOTOS_PER_STRIP) {
    strips.push(photos.slice(i, i + PHOTOS_PER_STRIP))
  }
  return strips
}
