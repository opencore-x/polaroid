import { type Orientation } from '@/lib/crop'
import { type PaperSize, DEFAULT_BORDER_WIDTH, sheetLayout } from '@/lib/layout'
import { type Photo } from '@/lib/photos'

/** One sheet's worth of photos, with the shape chosen for that page. */
export interface SheetSlice {
  shape: Orientation
  photos: Photo[]
}

/**
 * Splits photos into pages of an explicit `perRow × rows` grid. Each page can
 * have its own shape (from `pageShapes`, falling back to `defaultShape`); the
 * frame count per page is fixed at `perRow * rows` regardless of shape, since
 * cells are sized to fit rather than packed to whatever the height allows.
 */
export function paginate(
  photos: Photo[],
  perRow: number,
  rows: number,
  paper: PaperSize,
  defaultShape: Orientation,
  pageShapes: Orientation[],
  border = DEFAULT_BORDER_WIDTH,
): SheetSlice[] {
  const shapeAt = (page: number) => pageShapes[page] ?? defaultShape
  if (photos.length === 0) return [{ shape: shapeAt(0), photos: [] }]

  const pages: SheetSlice[] = []
  let index = 0
  let page = 0
  while (index < photos.length) {
    const shape = shapeAt(page)
    const { capacity } = sheetLayout(perRow, rows, paper, shape, border)
    pages.push({ shape, photos: photos.slice(index, index + capacity) })
    index += capacity
    page++
  }
  return pages
}
