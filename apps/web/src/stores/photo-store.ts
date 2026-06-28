import { create } from 'zustand'

import { formatCaptionDate } from '@/lib/date'
import { readExif } from '@/lib/exif'
import { reverseGeocode } from '@/lib/geocode'
import {
  type CaptionField,
  type Photo,
  createPhoto,
  isImageFile,
} from '@/lib/photos'

interface PhotoState {
  photos: Photo[]
  /** Adds image files to the collection. Returns how many were accepted. */
  addFiles: (files: File[]) => number
  setCaption: (id: string, field: CaptionField, value: string) => void
  /** Moves the photo with `activeId` to the position of `overId`. */
  reorder: (activeId: string, overId: string) => void
  remove: (id: string) => void
  clear: () => void
}

export const usePhotoStore = create<PhotoState>((set) => {
  // Fills empty captions from EXIF — city from GPS, date from capture time.
  // Runs async after the photo appears; never overwrites a caption the user
  // has already typed.
  async function enrich(photo: Photo) {
    const exif = await readExif(photo.file)
    const next: { captionTop?: string; captionBottom?: string } = {}
    if (exif.takenAt) next.captionBottom = formatCaptionDate(exif.takenAt)
    if (exif.latitude != null && exif.longitude != null) {
      const place = await reverseGeocode(exif.latitude, exif.longitude)
      if (place) next.captionTop = place.city
    }
    if (!next.captionTop && !next.captionBottom) return
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === photo.id
          ? {
              ...p,
              captionTop: p.captionTop || next.captionTop || '',
              captionBottom: p.captionBottom || next.captionBottom || '',
            }
          : p,
      ),
    }))
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
