import exifr from 'exifr'

export interface PhotoExif {
  latitude?: number
  longitude?: number
  takenAt?: Date
  /** A one-line camera/lens/exposure summary, when available. */
  cameraLine?: string
}

const CAMERA_TAGS = [
  'Make',
  'Model',
  'LensModel',
  'FNumber',
  'ExposureTime',
  'ISO',
  'FocalLength',
]

function formatExposureTime(seconds: number): string {
  if (seconds >= 1) return `${seconds}s`
  return `1/${Math.round(1 / seconds)}s`
}

/** Builds e.g. "Nikon D7000 · 35mm · f/2.8 1/200s ISO400". */
function formatCameraLine(meta: Record<string, unknown>): string | undefined {
  const make = typeof meta.Make === 'string' ? meta.Make.trim() : ''
  const model = typeof meta.Model === 'string' ? meta.Model.trim() : ''
  // Camera bodies often repeat the make inside the model ("NIKON D7000").
  const body = model.startsWith(make) ? model : [make, model].join(' ').trim()

  const parts: string[] = []
  if (body) parts.push(body)
  if (typeof meta.LensModel === 'string' && meta.LensModel.trim())
    parts.push(meta.LensModel.trim())
  if (typeof meta.FocalLength === 'number')
    parts.push(`${Math.round(meta.FocalLength)}mm`)

  const exposure: string[] = []
  if (typeof meta.FNumber === 'number') exposure.push(`f/${meta.FNumber}`)
  if (typeof meta.ExposureTime === 'number')
    exposure.push(formatExposureTime(meta.ExposureTime))
  if (typeof meta.ISO === 'number') exposure.push(`ISO${meta.ISO}`)
  if (exposure.length) parts.push(exposure.join(' '))

  return parts.length ? parts.join(' · ') : undefined
}

/**
 * Reads GPS, capture date and camera info from a photo's EXIF. All client-side.
 */
export async function readExif(file: File): Promise<PhotoExif> {
  const [gps, meta] = await Promise.all([
    exifr.gps(file).catch(() => null),
    exifr
      .parse(file, ['DateTimeOriginal', 'CreateDate', ...CAMERA_TAGS])
      .catch(() => null),
  ])

  const takenAt = meta?.DateTimeOriginal ?? meta?.CreateDate
  return {
    latitude: gps?.latitude,
    longitude: gps?.longitude,
    takenAt: takenAt instanceof Date ? takenAt : undefined,
    cameraLine: meta ? formatCameraLine(meta) : undefined,
  }
}
