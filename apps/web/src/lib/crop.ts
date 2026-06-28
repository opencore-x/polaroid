// How a photo is framed inside its polaroid window. The same math drives the
// on-screen preview (as CSS percentages) and the PDF rasterizer (as source
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

/** Shape of the photo window inside the (uniform) polaroid card. */
export type Orientation = 'square' | 'portrait' | 'landscape'
export const ORIENTATIONS: Orientation[] = ['square', 'portrait', 'landscape']
export const DEFAULT_ORIENTATION: Orientation = 'square'

/** Window aspect ratio (width / height) for each orientation. */
export function orientationAspect(orientation: Orientation): number {
  if (orientation === 'landscape') return 4 / 3
  if (orientation === 'portrait') return 3 / 4
  return 1
}

/** Best-guess orientation from a photo's own pixel dimensions. */
export function orientationFor(width: number, height: number): Orientation {
  const ratio = width / height
  if (ratio > 1.15) return 'landscape'
  if (ratio < 0.87) return 'portrait'
  return 'square'
}

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
 * The region of the source image (in natural pixels) that fills a window of the
 * given aspect, honouring the focal point and zoom. Clamped to stay on-image.
 */
export function cropSource(
  naturalW: number,
  naturalH: number,
  crop: Crop,
  aspect = 1,
) {
  // Largest window-aspect rect that fits the source, then zoomed.
  let sw = Math.min(naturalW, naturalH * aspect)
  let sh = sw / aspect
  sw /= crop.scale
  sh /= crop.scale
  const sx = clamp(crop.x * naturalW - sw / 2, 0, naturalW - sw)
  const sy = clamp(crop.y * naturalH - sh / 2, 0, naturalH - sh)
  return { sx, sy, sw, sh }
}

/**
 * CSS placement (percentages of the window) for an absolutely positioned <img>
 * so it shows exactly the region `cropSource` samples. Percentages keep it
 * responsive without needing the window's pixel size.
 */
export function coverStyle(
  naturalW: number,
  naturalH: number,
  crop: Crop,
  aspect = 1,
) {
  const { sx, sy, sw, sh } = cropSource(naturalW, naturalH, crop, aspect)
  return {
    width: `${(naturalW / sw) * 100}%`,
    height: `${(naturalH / sh) * 100}%`,
    left: `${(-sx / sw) * 100}%`,
    top: `${(-sy / sh) * 100}%`,
  }
}

/** Centred window dimensions for an orientation inside a square box of side B. */
export function windowBox(box: number, orientation: Orientation) {
  const aspect = orientationAspect(orientation)
  const width = aspect >= 1 ? box : box * aspect
  const height = aspect >= 1 ? box / aspect : box
  return {
    width,
    height,
    left: (box - width) / 2,
    top: (box - height) / 2,
  }
}
