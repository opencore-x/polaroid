// How a photo is framed inside its square polaroid window. The same math drives
// the on-screen preview (as CSS percentages) and the PDF rasterizer (as source
// pixels), so what you position is exactly what prints.

export interface Crop {
  /** Focal point X, as a fraction of the natural image width [0,1]. */
  x: number
  /** Focal point Y, as a fraction of the natural image height [0,1]. */
  y: number
  /** Zoom factor; 1 = fit (cover), larger = zoomed in. */
  scale: number
}

export const DEFAULT_CROP: Crop = { x: 0.5, y: 0.5, scale: 1 }
export const MIN_CROP_SCALE = 1
export const MAX_CROP_SCALE = 4

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export function clampCrop(crop: Crop): Crop {
  return {
    x: clamp(crop.x, 0, 1),
    y: clamp(crop.y, 0, 1),
    scale: clamp(crop.scale, MIN_CROP_SCALE, MAX_CROP_SCALE),
  }
}

export function isDefaultCrop(crop: Crop): boolean {
  return crop.x === 0.5 && crop.y === 0.5 && crop.scale === 1
}

/**
 * The square region of the source image (in natural pixels) that fills the
 * polaroid window, given the focal point and zoom. Clamped to stay on-image.
 */
export function cropSource(naturalW: number, naturalH: number, crop: Crop) {
  const side = Math.min(naturalW, naturalH) / crop.scale
  const sx = clamp(crop.x * naturalW - side / 2, 0, naturalW - side)
  const sy = clamp(crop.y * naturalH - side / 2, 0, naturalH - side)
  return { sx, sy, side }
}

/**
 * CSS placement (percentages of the square frame) for an absolutely positioned
 * <img> so it shows exactly the region `cropSource` samples. Percentages keep it
 * responsive without needing the frame's pixel size.
 */
export function coverStyle(naturalW: number, naturalH: number, crop: Crop) {
  const { sx, sy, side } = cropSource(naturalW, naturalH, crop)
  return {
    width: `${(naturalW / side) * 100}%`,
    height: `${(naturalH / side) * 100}%`,
    left: `${(-sx / side) * 100}%`,
    top: `${(-sy / side) * 100}%`,
  }
}
