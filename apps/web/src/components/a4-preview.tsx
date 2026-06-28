import { useLayoutEffect, useRef, useState } from 'react'

import { SheetPolaroid } from '@/components/sheet-polaroid'
import { captionFontStack } from '@/lib/fonts'
import { A4_MM, sheetLayout } from '@/lib/layout'
import { usePhotoStore } from '@/stores/photo-store'
import { useSettingsStore } from '@/stores/settings-store'

export function A4Preview() {
  const photos = usePhotoStore((state) => state.photos)
  const captionFontId = useSettingsStore((state) => state.captionFontId)
  const perRow = useSettingsStore((state) => state.polaroidsPerRow)
  const fontStack = captionFontStack(captionFontId)

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

  if (photos.length === 0) return null

  const layout = sheetLayout(perRow)
  const mmToPx = width / A4_MM.width
  const pageHeight = width * (A4_MM.height / A4_MM.width)
  const shown = photos.slice(0, layout.capacity)
  const overflow = photos.length - shown.length

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">Print sheet (A4)</h2>
      <div ref={containerRef} className="mx-auto w-full max-w-xl">
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
            shown.map((photo, index) => {
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
        </div>
      </div>
      {overflow > 0 && (
        <p className="text-muted-foreground text-xs">
          +{overflow} more won&apos;t fit on this sheet — multipage support is
          coming.
        </p>
      )}
    </section>
  )
}
