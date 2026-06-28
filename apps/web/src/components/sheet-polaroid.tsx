import { POLAROID } from '@/lib/layout'
import { type Photo } from '@/lib/photos'

/**
 * A polaroid sized proportionally to `width` (px) — everything scales with the
 * cell, so it matches the exported PDF which uses the same ratios.
 */
export function SheetPolaroid({
  photo,
  width,
  fontStack,
  showCaptions,
}: {
  photo: Photo
  width: number
  fontStack: string
  showCaptions: boolean
}) {
  const pad = width * POLAROID.framePad
  const imageSize = width - pad * 2

  return (
    <div
      className="flex flex-col bg-white shadow-sm"
      style={{
        width,
        height: width * POLAROID.aspect,
        padding: pad,
        paddingBottom: 0,
      }}
    >
      <div
        className="overflow-hidden bg-neutral-200"
        style={{ width: imageSize, height: imageSize }}
      >
        <img
          src={photo.url}
          alt={photo.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div
        className="flex flex-1 flex-col items-center justify-center overflow-hidden text-center"
        style={{ fontFamily: fontStack }}
      >
        {showCaptions && (
          <>
            <span
              className="max-w-full truncate"
              style={{
                fontSize: width * POLAROID.captionTopSize,
                lineHeight: 1.1,
                color: '#262626',
              }}
            >
              {photo.captionTop}
            </span>
            <span
              className="max-w-full truncate"
              style={{
                fontSize: width * POLAROID.captionBottomSize,
                lineHeight: 1.1,
                color: '#737373',
              }}
            >
              {photo.captionBottom}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
