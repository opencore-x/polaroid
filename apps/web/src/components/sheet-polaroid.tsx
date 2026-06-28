import { type CSSProperties } from 'react'

import { CroppedImage } from '@/components/cropped-image'
import { orientationAspect, windowPercent } from '@/lib/crop'
import { POLAROID } from '@/lib/layout'
import { type Photo } from '@/lib/photos'
import { cn } from '@/lib/utils'
import { usePhotoStore } from '@/stores/photo-store'

/**
 * A polaroid sized proportionally to `width` (px) so it matches the exported
 * PDF. On the editor sheet it's interactive: click to select, then drag/zoom the
 * photo and edit captions right on the frame.
 */
export function SheetPolaroid({
  photo,
  width,
  fontStack,
  showCaptions,
  showCameraLine,
  editable = false,
  selected = false,
  onSelect,
}: {
  photo: Photo
  width: number
  fontStack: string
  showCaptions: boolean
  showCameraLine: boolean
  editable?: boolean
  selected?: boolean
  onSelect?: () => void
}) {
  const setCrop = usePhotoStore((state) => state.setCrop)
  const setCaption = usePhotoStore((state) => state.setCaption)
  const pad = width * POLAROID.framePad
  const imageSize = width - pad * 2
  const editing = editable && selected

  return (
    <div
      className={cn(
        'flex flex-col bg-white shadow-sm transition-[outline-color]',
        editable && 'cursor-pointer outline outline-2 outline-transparent',
        editable && !selected && 'hover:outline-ring/40',
        selected && 'outline-primary',
      )}
      style={{
        width,
        height: width * POLAROID.aspect,
        padding: pad,
        paddingBottom: 0,
        outlineOffset: 2,
      }}
      onClick={
        editable
          ? (event) => {
              event.stopPropagation()
              onSelect?.()
            }
          : undefined
      }
    >
      <div
        className="relative overflow-hidden bg-white"
        style={{ width: imageSize, height: imageSize }}
      >
        <div
          className="absolute overflow-hidden bg-neutral-200"
          style={windowPercent(photo.orientation)}
        >
          <CroppedImage
            src={photo.url}
            alt={photo.name}
            crop={photo.crop}
            aspect={orientationAspect(photo.orientation)}
            onCropChange={
              editing ? (crop) => setCrop(photo.id, crop) : undefined
            }
          />
        </div>
      </div>
      <div
        className="flex flex-1 flex-col items-center justify-center overflow-hidden text-center"
        style={{ fontFamily: fontStack }}
      >
        {showCaptions && (
          <>
            <CaptionLine
              value={photo.captionTop}
              editing={editing}
              placeholder="Add caption"
              onChange={(value) => setCaption(photo.id, 'captionTop', value)}
              style={{
                fontSize: width * POLAROID.captionTopSize,
                lineHeight: 1.1,
                color: '#262626',
              }}
            />
            <CaptionLine
              value={photo.captionBottom}
              editing={editing}
              placeholder="Date"
              onChange={(value) => setCaption(photo.id, 'captionBottom', value)}
              style={{
                fontSize: width * POLAROID.captionBottomSize,
                lineHeight: 1.1,
                color: '#737373',
              }}
            />
            {showCameraLine && photo.cameraLine && (
              <span
                className="max-w-full truncate"
                style={{ fontSize: width * 0.045, lineHeight: 1.2, color: '#a3a3a3' }}
              >
                {photo.cameraLine}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CaptionLine({
  value,
  editing,
  placeholder,
  onChange,
  style,
}: {
  value: string
  editing: boolean
  placeholder: string
  onChange: (value: string) => void
  style: CSSProperties
}) {
  if (editing) {
    return (
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        aria-label="Polaroid caption"
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-center placeholder:text-neutral-300 focus:outline-none"
        style={style}
      />
    )
  }
  return (
    <span className="max-w-full truncate" style={style}>
      {value}
    </span>
  )
}
