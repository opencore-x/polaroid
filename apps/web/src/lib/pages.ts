import { type Orientation } from '@/lib/crop'
import { type PaperSize, DEFAULT_BORDER_WIDTH, sheetLayout } from '@/lib/layout'
import { type Photo } from '@/lib/photos'

/** One sheet's worth of photos, with the shape chosen for that page. */
export interface SheetSlice {
  shape: Orientation
  photos: Photo[]
}

/**
 * Splits photos into pages. Each page can have its own shape (from `pageShapes`,
 * falling back to `defaultShape`), and since capacity depends on the shape, the
 * fill is sequential — a tall page simply holds fewer frames than a square one.
 */
export function paginate(
  photos: Photo[],
  perRow: number,
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
    const { capacity } = sheetLayout(perRow, paper, shape, border)
    pages.push({ shape, photos: photos.slice(index, index + capacity) })
    index += capacity
    page++
  }
  return pages
}
