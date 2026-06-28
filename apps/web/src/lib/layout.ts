export const PT_PER_MM = 72 / 25.4

export interface PaperSize {
  id: string
  label: string
  widthMm: number
  heightMm: number
  /** Printer-safe inner margin for this stock (mm). */
  marginMm: number
}

// Common print stocks. Photo papers (4×6 / 5×7) get a tighter margin since
// they're often run borderless; A4 / Letter keep 10mm to clear the inkjet
// non-printable edge.
export const PAPER_SIZES: PaperSize[] = [
  { id: 'a4', label: 'A4', widthMm: 210, heightMm: 297, marginMm: 10 },
  { id: 'letter', label: 'US Letter', widthMm: 215.9, heightMm: 279.4, marginMm: 10 },
  { id: '4x6', label: '4×6 in', widthMm: 101.6, heightMm: 152.4, marginMm: 5 },
  { id: '5x7', label: '5×7 in', widthMm: 127, heightMm: 177.8, marginMm: 5 },
  { id: 'square', label: 'Square 8 in', widthMm: 203.2, heightMm: 203.2, marginMm: 6 },
]

export const DEFAULT_PAPER_SIZE_ID = 'a4'

export function paperSize(id: string): PaperSize {
  return PAPER_SIZES.find((paper) => paper.id === id) ?? PAPER_SIZES[0]
}

// Polaroid proportions, expressed as ratios of the polaroid's width so the same
// numbers drive the on-screen preview (px) and the exported PDF (pt).
export const POLAROID = {
  aspect: 1.2, // height / width
  framePad: 0.05, // white border on sides + top
  captionTopSize: 0.1, // city line font size
  captionBottomSize: 0.075, // date line font size
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * L-shaped trim ticks at each corner of a polaroid, offset outward by `gap` so
 * the marks point at the cut corners without inking the trim line itself.
 */
export function cropMarks(r: Rect, len = 2.5, gap = 1): Segment[] {
  const left = r.x
  const top = r.y
  const right = r.x + r.width
  const bottom = r.y + r.height
  return [
    { x1: left - gap - len, y1: top, x2: left - gap, y2: top },
    { x1: left, y1: top - gap - len, x2: left, y2: top - gap },
    { x1: right + gap, y1: top, x2: right + gap + len, y2: top },
    { x1: right, y1: top - gap - len, x2: right, y2: top - gap },
    { x1: left - gap - len, y1: bottom, x2: left - gap, y2: bottom },
    { x1: left, y1: bottom + gap, x2: left, y2: bottom + gap + len },
    { x1: right + gap, y1: bottom, x2: right + gap + len, y2: bottom },
    { x1: right, y1: bottom + gap, x2: right, y2: bottom + gap + len },
  ]
}

export interface SheetLayout {
  perRow: number
  rows: number
  /** Max polaroids that fit on one sheet. */
  capacity: number
  cellWidthMm: number
  cellHeightMm: number
  marginMm: number
  gapMm: number
  /** Top-left position + size (mm) of the polaroid at `index` on the sheet. */
  rectFor: (index: number) => Rect
}

export function sheetLayout(
  perRow: number,
  paper: PaperSize,
  gapMm = 4,
): SheetLayout {
  const marginMm = paper.marginMm
  const usableW = paper.widthMm - marginMm * 2
  const usableH = paper.heightMm - marginMm * 2
  const cellWidthMm = (usableW - gapMm * (perRow - 1)) / perRow
  const cellHeightMm = cellWidthMm * POLAROID.aspect
  const rows = Math.max(1, Math.floor((usableH + gapMm) / (cellHeightMm + gapMm)))
  const capacity = perRow * rows

  const rectFor = (index: number): Rect => {
    const col = index % perRow
    const row = Math.floor(index / perRow)
    return {
      x: marginMm + col * (cellWidthMm + gapMm),
      y: marginMm + row * (cellHeightMm + gapMm),
      width: cellWidthMm,
      height: cellHeightMm,
    }
  }

  return {
    perRow,
    rows,
    capacity,
    cellWidthMm,
    cellHeightMm,
    marginMm,
    gapMm,
    rectFor,
  }
}
