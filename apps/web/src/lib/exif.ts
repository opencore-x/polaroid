import exifr from 'exifr'

export interface PhotoExif {
  latitude?: number
  longitude?: number
  takenAt?: Date
}

/** Reads GPS + capture date from a photo's EXIF. All client-side. */
export async function readExif(file: File): Promise<PhotoExif> {
  const [gps, meta] = await Promise.all([
    exifr.gps(file).catch(() => null),
    exifr.parse(file, ['DateTimeOriginal', 'CreateDate']).catch(() => null),
  ])

  const takenAt = meta?.DateTimeOriginal ?? meta?.CreateDate
  return {
    latitude: gps?.latitude,
    longitude: gps?.longitude,
    takenAt: takenAt instanceof Date ? takenAt : undefined,
  }
}
