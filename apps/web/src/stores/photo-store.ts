import { create } from 'zustand'

import { type Photo, createPhoto, isImageFile } from '@/lib/photos'

interface PhotoState {
  photos: Photo[]
  /** Adds image files to the collection. Returns how many were accepted. */
  addFiles: (files: File[]) => number
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
