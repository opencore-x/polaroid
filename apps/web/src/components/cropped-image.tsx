import { type PointerEvent, type WheelEvent, useRef, useState } from 'react'
import { ImageOff } from 'lucide-react'

import { type Crop, clampCrop, coverStyle } from '@/lib/crop'
import { cn } from '@/lib/utils'

interface DragStart {
  pointerX: number
  pointerY: number
  crop: Crop
  frame: number
}

/**
 * Renders a photo framed by `crop` inside a square window. When `onCropChange`
 * is provided it's interactive: drag to pan, wheel to zoom, double-click to
 * reset. The placement comes from the same math the PDF uses, so the preview
 * matches the print.
 */
export function CroppedImage({
  src,
  alt,
  crop,
  onCropChange,
}: {
  src: string
  alt: string
  crop: Crop
  onCropChange?: (crop: Crop) => void
}) {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [failed, setFailed] = useState(false)
  const drag = useRef<DragStart | null>(null)
  const editable = !!onCropChange

  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-neutral-200 text-neutral-400">
        <ImageOff className="size-6" />
        <span className="text-[10px]">Preview unavailable</span>
      </div>
    )
  }

  const placed = natural ? coverStyle(natural.w, natural.h, crop) : undefined

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!editable || !natural) return
    event.stopPropagation()
    drag.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      crop,
      frame: event.currentTarget.getBoundingClientRect().width,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current
    if (!start || !natural || !onCropChange) return
    const side = Math.min(natural.w, natural.h) / start.crop.scale
    const dx = (event.clientX - start.pointerX) / start.frame
    const dy = (event.clientY - start.pointerY) / start.frame
    onCropChange(
      clampCrop({
        x: start.crop.x - dx * (side / natural.w),
        y: start.crop.y - dy * (side / natural.h),
        scale: start.crop.scale,
      }),
    )
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!onCropChange) return
    event.preventDefault()
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1
    onCropChange(clampCrop({ ...crop, scale: crop.scale * factor }))
  }

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden bg-neutral-200',
        editable && 'cursor-grab touch-none active:cursor-grabbing',
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={editable ? handleWheel : undefined}
      onDoubleClick={
        onCropChange
          ? () => onCropChange({ x: 0.5, y: 0.5, scale: 1 })
          : undefined
      }
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading="lazy"
        onLoad={(event) =>
          setNatural({
            w: event.currentTarget.naturalWidth,
            h: event.currentTarget.naturalHeight,
          })
        }
        onError={() => setFailed(true)}
        className={cn(
          'pointer-events-none select-none',
          placed ? 'absolute max-w-none' : 'h-full w-full object-cover',
        )}
        style={placed}
      />
    </div>
  )
}
