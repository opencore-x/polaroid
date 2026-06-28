import { create } from 'zustand'

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
  remove: (id: string) => void
  clear: () => void
}

export const usePhotoStore = create<PhotoState>((set) => ({
  photos: [],
  addFiles: (files) => {
    const accepted = files.filter(isImageFile).map(createPhoto)
    if (accepted.length > 0) {
      set((state) => ({ photos: [...state.photos, ...accepted] }))
    }
    return accepted.length
  },
  setCaption: (id, field, value) =>
    set((state) => ({
      photos: state.photos.map((photo) =>
        photo.id === id ? { ...photo, [field]: value } : photo,
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
}))
