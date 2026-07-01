import { SheetCard } from '@/components/sheet-card'
import { type Orientation } from '@/lib/crop'
import { type PaperSize, cropMarks, sheetLayout } from '@/lib/layout'
import { type Photo } from '@/lib/photos'
import { useEditorStore } from '@/stores/editor-store'

/** One print sheet: margin guide, positioned cards, and crop marks. */
export function SheetPage({
  photos,
  width,
  perRow,
  rows,
  paper,
  shape,
  borderColor,
  borderWidth,
  fontStack,
  showCutMarks,
  showCaptions,
  showCameraLine,
  editable = false,
}: {
  photos: Photo[]
  width: number
  perRow: number
  rows: number
  paper: PaperSize
  shape: Orientation
  borderColor: string
  borderWidth: number
  fontStack: string
  showCutMarks: boolean
  showCaptions: boolean
  showCameraLine: boolean
  editable?: boolean
}) {
  const selectedId = useEditorStore((state) => state.selectedId)
  const select = useEditorStore((state) => state.select)
  const layout = sheetLayout(perRow, rows, paper, shape, borderWidth)
  const mmToPx = width / paper.widthMm
  const pageHeight = width * (paper.heightMm / paper.widthMm)

  return (
    <div
      className="relative bg-white shadow-md ring-1 ring-black/10"
      style={{ width: width || '100%', height: pageHeight }}
      onClick={editable ? () => select(null) : undefined}
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
              style={{
                left: rect.x * mmToPx,
                top: rect.y * mmToPx,
                zIndex: editable && selectedId === photo.id ? 10 : undefined,
              }}
            >
              <SheetCard
                photo={photo}
                width={rect.width * mmToPx}
                shape={shape}
                borderColor={borderColor}
                borderWidth={borderWidth}
                fontStack={fontStack}
                showCaptions={showCaptions}
                showCameraLine={showCameraLine}
                editable={editable}
                selected={editable && selectedId === photo.id}
                onSelect={() => select(photo.id)}
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
