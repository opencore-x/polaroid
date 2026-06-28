import { create } from 'zustand'

import { type Crop, type Orientation, orientationFor } from '@/lib/crop'
import { type DateFormat, formatCaptionDate, isAutoDate } from '@/lib/date'
import { readExif } from '@/lib/exif'
import { reverseGeocode } from '@/lib/geocode'
import {
  type CaptionField,
  type Photo,
  createPhoto,
  isImageFile,
} from '@/lib/photos'
import {
  type CaptionLocation,
  useSettingsStore,
} from '@/stores/settings-store'

interface PhotoState {
  photos: Photo[]
  /** Adds image files to the collection. Returns how many were accepted. */
  addFiles: (files: File[]) => number
  setCaption: (id: string, field: CaptionField, value: string) => void
  /** Updates how a photo is framed (pan + zoom) inside its window. */
  setCrop: (id: string, crop: Crop) => void
  setOrientation: (id: string, orientation: Orientation) => void
  /** Moves the photo with `activeId` to the position of `overId`. */
  reorder: (activeId: string, overId: string) => void
  /** Re-derives auto location captions when the city/country mode changes. */
  applyLocationMode: (mode: CaptionLocation) => void
  /** Re-derives auto date captions when the date format changes. */
  applyDateFormat: (format: DateFormat) => void
  remove: (id: string) => void
  clear: () => void
}

export const usePhotoStore = create<PhotoState>((set) => {
  // Fills empty captions from EXIF — city from GPS, date from capture time.
  // Runs async after the photo appears; never overwrites a caption the user
  // has already typed.
  // Defaults a photo's window orientation to its own aspect ratio, unless the
  // user has already changed it away from the square default.
  async function autoOrient(photo: Photo) {
    try {
      const bitmap = await createImageBitmap(photo.file)
      const orientation = orientationFor(bitmap.width, bitmap.height)
      bitmap.close()
      set((state) => ({
        photos: state.photos.map((p) =>
          p.id === photo.id && p.orientation === 'square'
            ? { ...p, orientation }
            : p,
        ),
      }))
    } catch {
      // Leave the square default if the image can't be decoded.
    }
  }

  async function enrich(photo: Photo) {
    void autoOrient(photo)
    try {
      const settings = useSettingsStore.getState()
      const exif = await readExif(photo.file)
      const next: {
        captionTop?: string
        captionBottom?: string
        place?: { city: string; country: string }
        takenAt?: number
        cameraLine?: string
      } = { cameraLine: exif.cameraLine }
      if (exif.takenAt) {
        next.takenAt = exif.takenAt.getTime()
        next.captionBottom = formatCaptionDate(exif.takenAt, settings.dateFormat)
      }
      if (exif.latitude != null && exif.longitude != null) {
        const place = await reverseGeocode(exif.latitude, exif.longitude)
        if (place) {
          next.place = { city: place.city, country: place.country }
          next.captionTop = next.place[settings.captionLocation]
        }
      }
      if (
        next.captionTop ||
        next.captionBottom ||
        next.place ||
        next.cameraLine
      ) {
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === photo.id
              ? {
                  ...p,
                  place: p.place ?? next.place,
                  takenAt: p.takenAt ?? next.takenAt,
                  cameraLine: p.cameraLine ?? next.cameraLine,
                  captionTop: p.captionTop || next.captionTop || '',
                  captionBottom: p.captionBottom || next.captionBottom || '',
                }
              : p,
          ),
        }))
      }
    } finally {
      set((state) => ({
        photos: state.photos.map((p) =>
          p.id === photo.id ? { ...p, enriching: false } : p,
        ),
      }))
    }
  }

  return {
    photos: [],
    addFiles: (files) => {
      const accepted = files.filter(isImageFile).map(createPhoto)
      if (accepted.length === 0) return 0
      set((state) => ({ photos: [...state.photos, ...accepted] }))
      for (const photo of accepted) void enrich(photo)
      return accepted.length
    },
    setCaption: (id, field, value) =>
      set((state) => ({
        photos: state.photos.map((photo) =>
          photo.id === id ? { ...photo, [field]: value } : photo,
        ),
      })),
    setCrop: (id, crop) =>
      set((state) => ({
        photos: state.photos.map((photo) =>
          photo.id === id ? { ...photo, crop } : photo,
        ),
      })),
    setOrientation: (id, orientation) =>
      set((state) => ({
        photos: state.photos.map((photo) =>
          photo.id === id ? { ...photo, orientation } : photo,
        ),
      })),
    reorder: (activeId, overId) =>
      set((state) => {
        const from = state.photos.findIndex((p) => p.id === activeId)
        const to = state.photos.findIndex((p) => p.id === overId)
        if (from === -1 || to === -1 || from === to) return state
        const photos = state.photos.slice()
        const [moved] = photos.splice(from, 1)
        photos.splice(to, 0, moved)
        return { photos }
      }),
    applyLocationMode: (mode) =>
      set((state) => ({
        photos: state.photos.map((p) => {
          if (!p.place) return p
          const isAuto =
            p.captionTop === '' ||
            p.captionTop === p.place.city ||
            p.captionTop === p.place.country
          return isAuto ? { ...p, captionTop: p.place[mode] } : p
        }),
      })),
    applyDateFormat: (format) =>
      set((state) => ({
        photos: state.photos.map((p) =>
          p.takenAt != null && isAutoDate(p.captionBottom, p.takenAt)
            ? {
                ...p,
                captionBottom: formatCaptionDate(new Date(p.takenAt), format),
              }
            : p,
        ),
      })),
    remove: (id) =>
      set((state) => {
        const target = state.photos.find((photo) => photo.id === id)
        if (target) URL.revokeObjectURL(target.url)
        return { photos: state.photos.filter((photo) => photo.id !== id) }
      }),
    clear: () =>
      set((state) => {
        state.photos.forEach((photo) => URL.revokeObjectURL(photo.url))
        return { photos: [] }
      }),
  }
})
