import {
  type Crop,
  DEFAULT_CROP,
  DEFAULT_ORIENTATION,
  type Orientation,
} from '@/lib/crop'
import { type Photo } from '@/lib/photos'
import { type SettingsSnapshot } from '@/stores/settings-store'

// A portable project file: the layout, captions, settings and the images
// themselves, all in one self-contained JSON. No account, no cloud — just a
// file you own, that re-opens the exact same sheet anywhere.

const PROJECT_VERSION = 1

interface ProjectPhoto {
  name: string
  captionTop: string
  captionBottom: string
  place?: { city: string; country: string }
  takenAt?: number
  cameraLine?: string
  crop: Crop
  orientation: Orientation
  borderColor?: string
  /** The image embedded as a data URL (base64). */
  dataUrl: string
}

interface ProjectFile {
  version: number
  settings: SettingsSnapshot
  photos: ProjectPhoto[]
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function buildProjectFile(
  photos: Photo[],
  settings: SettingsSnapshot,
): Promise<ProjectFile> {
  const projectPhotos = await Promise.all(
    photos.map(async (photo) => ({
      name: photo.name,
      captionTop: photo.captionTop,
      captionBottom: photo.captionBottom,
      place: photo.place,
      takenAt: photo.takenAt,
      cameraLine: photo.cameraLine,
      crop: photo.crop,
      orientation: photo.orientation,
      borderColor: photo.borderColor,
      dataUrl: await fileToDataUrl(photo.file),
    })),
  )
  return { version: PROJECT_VERSION, settings, photos: projectPhotos }
}

export async function downloadProject(
  photos: Photo[],
  settings: SettingsSnapshot,
  filename = 'polaroid-project.json',
): Promise<void> {
  const project = await buildProjectFile(photos, settings)
  const blob = new Blob([JSON.stringify(project)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/** Parses a project file back into live photos (new ids, fresh object URLs). */
export async function importProject(file: File): Promise<{
  photos: Photo[]
  settings: Partial<SettingsSnapshot>
}> {
  const parsed = JSON.parse(await file.text()) as ProjectFile
  if (!parsed || !Array.isArray(parsed.photos)) {
    throw new Error('Invalid project file')
  }
  const photos = await Promise.all(
    parsed.photos.map(async (entry) => {
      const blob = await (await fetch(entry.dataUrl)).blob()
      const rebuilt = new File([blob], entry.name || 'photo', {
        type: blob.type,
      })
      return {
        id: crypto.randomUUID(),
        file: rebuilt,
        url: URL.createObjectURL(rebuilt),
        name: rebuilt.name,
        size: rebuilt.size,
        captionTop: entry.captionTop ?? '',
        captionBottom: entry.captionBottom ?? '',
        place: entry.place,
        takenAt: entry.takenAt,
        cameraLine: entry.cameraLine,
        crop: entry.crop ?? DEFAULT_CROP,
        orientation: entry.orientation ?? DEFAULT_ORIENTATION,
        borderColor: entry.borderColor,
        enriching: false,
      } satisfies Photo
    }),
  )
  return { photos, settings: parsed.settings ?? {} }
}
