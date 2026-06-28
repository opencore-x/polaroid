export interface Photo {
  id: string
  file: File
  /** Object URL for previewing — must be revoked when the photo is removed. */
  url: string
  name: string
  size: number
  /** Polaroid caption lines (auto-filled from EXIF later; editable). */
  captionTop: string
  captionBottom: string
  /** Place resolved from EXIF GPS — kept so the city/country toggle can switch. */
  place?: { city: string; country: string }
}

export type CaptionField = 'captionTop' | 'captionBottom'

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif|avif|gif|bmp|tiff?)$/i

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || IMAGE_EXTENSIONS.test(file.name)
}

export function createPhoto(file: File): Photo {
  return {
    id: crypto.randomUUID(),
    file,
    url: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    captionTop: '',
    captionBottom: '',
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`
}
