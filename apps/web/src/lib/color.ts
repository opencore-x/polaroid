// Small colour helpers shared by the preview (hex / CSS) and the PDF (0–1 rgb).

export interface Rgb {
  r: number
  g: number
  b: number
}

/** Parse #rgb or #rrggbb into 0–255 channels. */
export function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const int = parseInt(full, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

/** Same parse, normalised to 0–1 for pdf-lib's `rgb()`. */
export function hexToRgb01(hex: string): Rgb {
  const { r, g, b } = hexToRgb(hex)
  return { r: r / 255, g: g / 255, b: b / 255 }
}

/** Perceived-luminance test so we know when to flip caption text to light. */
export function isDarkColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55
}

export interface CaptionColors {
  top: string
  bottom: string
  camera: string
}

/** Caption text colours that stay legible on a given border colour. */
export function captionColors(border: string): CaptionColors {
  return isDarkColor(border)
    ? { top: '#f5f5f5', bottom: '#d4d4d4', camera: '#a3a3a3' }
    : { top: '#262626', bottom: '#737373', camera: '#a3a3a3' }
}
