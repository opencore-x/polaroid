import { SheetPolaroid } from '@/components/sheet-polaroid'
import { A4_MM, cropMarks, sheetLayout } from '@/lib/layout'
import { type Photo } from '@/lib/photos'

/** One A4 sheet: margin guide, positioned polaroids, and crop marks. */
export function SheetPage({
  photos,
  width,
  perRow,
  fontStack,
  showCutMarks,
}: {
  photos: Photo[]
  width: number
  perRow: number
  fontStack: string
  showCutMarks: boolean
}) {
  const layout = sheetLayout(perRow)
  const mmToPx = width / A4_MM.width
  const pageHeight = width * (A4_MM.height / A4_MM.width)

  return (
    <div
      className="relative bg-white shadow-md ring-1 ring-black/10"
      style={{ width: width || '100%', height: pageHeight }}
    >
      <div
        className="pointer-events-none absolute border border-dashed border-neutral-300"
        style={{
          left: layout.marginMm * mmToPx,
          top: layout.marginMm * mmToPx,
          right: layout.marginMm * mmToPx,
          bottom: layout.marginMm * mmToPx,
        }}
      />
      {width > 0 &&
        photos.map((photo, index) => {
          const rect = layout.rectFor(index)
          return (
            <div
              key={photo.id}
              className="absolute"
              style={{ left: rect.x * mmToPx, top: rect.y * mmToPx }}
            >
              <SheetPolaroid
                photo={photo}
                width={rect.width * mmToPx}
                fontStack={fontStack}
              />
            </div>
          )
        })}
      {showCutMarks && width > 0 && (
        <svg
          className="pointer-events-none absolute inset-0"
          width={width}
          height={pageHeight}
        >
          {photos.flatMap((photo, index) =>
            cropMarks(layout.rectFor(index)).map((seg, segIndex) => (
              <line
                key={`${photo.id}-${segIndex}`}
                x1={seg.x1 * mmToPx}
                y1={seg.y1 * mmToPx}
                x2={seg.x2 * mmToPx}
                y2={seg.y2 * mmToPx}
                stroke="#9ca3af"
                strokeWidth={0.75}
              />
            )),
          )}
        </svg>
      )}
    </div>
  )
}
