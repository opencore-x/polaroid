import { CroppedImage } from '@/components/cropped-image'
import { orientationAspect, windowPercent } from '@/lib/crop'
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
  showCameraLine,
}: {
  photo: Photo
  width: number
  fontStack: string
  showCaptions: boolean
  showCameraLine: boolean
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
          />
        </div>
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
            {showCameraLine && photo.cameraLine && (
              <span
                className="max-w-full truncate"
                style={{
                  fontSize: width * 0.045,
                  lineHeight: 1.2,
                  color: '#a3a3a3',
                }}
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
