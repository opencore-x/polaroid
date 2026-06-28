import { useLayoutEffect, useRef, useState } from 'react'

import { SheetInspector } from '@/components/sheet-inspector'
import { SheetPage } from '@/components/sheet-page'
import { captionFontStack } from '@/lib/fonts'
import { paperSize, sheetLayout } from '@/lib/layout'
import { usePhotoStore } from '@/stores/photo-store'
import { useSettingsStore } from '@/stores/settings-store'

/** The centre column: the print sheet itself, with a floating frame inspector. */
export function A4Preview() {
  const photos = usePhotoStore((state) => state.photos)
  const captionFontId = useSettingsStore((state) => state.captionFontId)
  const paperSizeId = useSettingsStore((state) => state.paperSizeId)
  const frameShape = useSettingsStore((state) => state.frameShape)
  const perRow = useSettingsStore((state) => state.polaroidsPerRow)
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

  const { capacity } = sheetLayout(perRow, paper, frameShape)
  const pageCount = photos.length
    ? Math.max(1, Math.ceil(photos.length / capacity))
    : 1
  const pages = Array.from({ length: pageCount }, (_, page) =>
    photos.slice(page * capacity, (page + 1) * capacity),
  )

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
            key={`page-${slice[0]?.id ?? page}`}
            className="flex flex-col gap-1"
          >
            {pageCount > 1 && (
              <span className="text-muted-foreground text-xs">
                Page {page + 1} of {pageCount}
              </span>
            )}
            <SheetPage
              photos={slice}
              width={width}
              perRow={perRow}
              paper={paper}
              shape={frameShape}
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
