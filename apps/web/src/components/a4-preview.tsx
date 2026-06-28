import { useLayoutEffect, useRef, useState } from 'react'

import { SheetControls } from '@/components/sheet-controls'
import { SheetPage } from '@/components/sheet-page'
import { Button } from '@/components/ui/button'
import { captionFontStack } from '@/lib/fonts'
import { paperSize, sheetLayout } from '@/lib/layout'
import { downloadSheetPdf } from '@/lib/pdf'
import { usePhotoStore } from '@/stores/photo-store'
import { useSettingsStore } from '@/stores/settings-store'

export function A4Preview() {
  const photos = usePhotoStore((state) => state.photos)
  const captionFontId = useSettingsStore((state) => state.captionFontId)
  const paperSizeId = useSettingsStore((state) => state.paperSizeId)
  const perRow = useSettingsStore((state) => state.polaroidsPerRow)
  const showCutMarks = useSettingsStore((state) => state.showCutMarks)
  const showCaptions = useSettingsStore((state) => state.showCaptions)
  const showCameraLine = useSettingsStore((state) => state.showCameraLine)
  const fontStack = captionFontStack(captionFontId)
  const paper = paperSize(paperSizeId)

  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await downloadSheetPdf(
        photos,
        perRow,
        showCutMarks,
        showCaptions,
        showCameraLine,
        paper,
        captionFontId,
      )
    } finally {
      setIsExporting(false)
    }
  }

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (photos.length === 0) return null

  const { capacity } = sheetLayout(perRow, paper)
  const pageCount = Math.max(1, Math.ceil(photos.length / capacity))
  const pages = Array.from({ length: pageCount }, (_, page) =>
    photos.slice(page * capacity, (page + 1) * capacity),
  )

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">
          Print sheet ({paper.label})
          {pageCount > 1 ? ` — ${pageCount} pages` : ''}
        </h2>
        <Button
          size="sm"
          disabled={isExporting}
          onClick={() => void handleExport()}
        >
          {isExporting ? 'Preparing…' : 'Export PDF'}
        </Button>
      </div>
      <SheetControls />
      <div
        ref={containerRef}
        className="mx-auto flex w-full max-w-xl flex-col gap-5"
      >
        {pages.map((slice, page) => (
          <div key={`page-${slice[0]?.id ?? page}`} className="flex flex-col gap-1">
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
              fontStack={fontStack}
              showCutMarks={showCutMarks}
              showCaptions={showCaptions}
              showCameraLine={showCameraLine}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
