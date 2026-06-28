import { useLayoutEffect, useRef, useState } from 'react'
import {
  RectangleHorizontal,
  RectangleVertical,
  Square,
} from 'lucide-react'

import { SheetInspector } from '@/components/sheet-inspector'
import { SheetPage } from '@/components/sheet-page'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type Orientation } from '@/lib/crop'
import { captionFontStack } from '@/lib/fonts'
import { FRAME_SHAPES, paperSize } from '@/lib/layout'
import { paginate } from '@/lib/pages'
import { cn } from '@/lib/utils'
import { usePhotoStore } from '@/stores/photo-store'
import { useSettingsStore } from '@/stores/settings-store'

const SHAPE_ICONS: Record<Orientation, typeof Square> = {
  square: Square,
  portrait: RectangleVertical,
  landscape: RectangleHorizontal,
}

/** The centre column: the print sheet itself, with a floating frame inspector. */
export function A4Preview() {
  const photos = usePhotoStore((state) => state.photos)
  const captionFontId = useSettingsStore((state) => state.captionFontId)
  const paperSizeId = useSettingsStore((state) => state.paperSizeId)
  const frameShape = useSettingsStore((state) => state.frameShape)
  const pageShapes = useSettingsStore((state) => state.pageShapes)
  const setPageShape = useSettingsStore((state) => state.setPageShape)
  const borderColor = useSettingsStore((state) => state.borderColor)
  const borderWidth = useSettingsStore((state) => state.borderWidth)
  const perRow = useSettingsStore((state) => state.polaroidsPerRow)
  const rows = useSettingsStore((state) => state.rowsPerPage)
  const showCutMarks = useSettingsStore((state) => state.showCutMarks)
  const showCaptions = useSettingsStore((state) => state.showCaptions)
  const showCameraLine = useSettingsStore((state) => state.showCameraLine)
  const fontStack = captionFontStack(captionFontId)
  const paper = paperSize(paperSizeId)

  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const pages = paginate(photos, perRow, rows, paper, frameShape, pageShapes, borderWidth)
  const pageCount = pages.length

  return (
    <section className="flex flex-col gap-3">
      {/* Pinned to the screen, so the selected frame's tools never shift the page. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
        <SheetInspector />
      </div>
      <div
        ref={containerRef}
        className="mx-auto flex w-full max-w-xl flex-col gap-5"
      >
        {pages.map((slice, page) => (
          <div
            key={`page-${slice.photos[0]?.id ?? page}`}
            className="flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                {pageCount > 1 ? `Page ${page + 1} of ${pageCount}` : ''}
              </span>
              <PageShapeToggle
                value={slice.shape}
                onChange={(shape) => setPageShape(page, shape)}
              />
            </div>
            <SheetPage
              photos={slice.photos}
              width={width}
              perRow={perRow}
              rows={rows}
              paper={paper}
              shape={slice.shape}
              borderColor={borderColor}
              borderWidth={borderWidth}
              fontStack={fontStack}
              showCutMarks={showCutMarks}
              showCaptions={showCaptions}
              showCameraLine={showCameraLine}
              editable
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function PageShapeToggle({
  value,
  onChange,
}: {
  value: Orientation
  onChange: (shape: Orientation) => void
}) {
  return (
    <div className="flex gap-0.5">
      {FRAME_SHAPES.map(({ id, label }) => {
        const Icon = SHAPE_ICONS[id]
        const active = value === id
        return (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`${label} frames on this page`}
                aria-pressed={active}
                onClick={() => onChange(id)}
                className={cn(
                  'text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 items-center justify-center rounded',
                  active && 'bg-accent text-foreground',
                )}
              >
                <Icon className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{label} frames on this page</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
