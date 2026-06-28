export const A4_MM = { width: 210, height: 297 }
export const PT_PER_MM = 72 / 25.4

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
  marginMm = 8,
  gapMm = 4,
): SheetLayout {
  const usableW = A4_MM.width - marginMm * 2
  const usableH = A4_MM.height - marginMm * 2
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
