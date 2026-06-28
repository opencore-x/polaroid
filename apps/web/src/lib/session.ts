import {
  type Crop,
  DEFAULT_CROP,
  DEFAULT_ORIENTATION,
  type Orientation,
} from '@/lib/crop'
import { type Photo } from '@/lib/photos'
import { type SettingsSnapshot } from '@/stores/settings-store'

// Client-side session storage. Photos (blobs + their caption/order metadata) and
// settings live in IndexedDB so a refresh or accidental tab close doesn't wipe
// the working set. Nothing ever leaves the device.

const DB_NAME = 'polaroid'
const DB_VERSION = 1
const BLOBS = 'blobs' // key: photo id -> File
const META = 'meta' // key: photo id -> PhotoMeta
const SETTINGS = 'settings' // key: 'current' -> SettingsSnapshot

interface PhotoMeta {
  id: string
  name: string
  size: number
  captionTop: string
  captionBottom: string
  place?: { city: string; country: string }
  crop?: Crop
  orientation?: Orientation
  /** Position on the sheet; metas are sorted by this on load. */
  order: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(BLOBS)) db.createObjectStore(BLOBS)
        if (!db.objectStoreNames.contains(META)) db.createObjectStore(META)
        if (!db.objectStoreNames.contains(SETTINGS))
          db.createObjectStore(SETTINGS)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbPromise
}

function reqResult<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

/** Reads the saved session back, regenerating object URLs from stored blobs. */
export async function loadSession(): Promise<{
  photos: Photo[]
  settings: SettingsSnapshot | null
}> {
  try {
    const db = await openDb()
    const tx = db.transaction([BLOBS, META, SETTINGS], 'readonly')
    // Issue every request before awaiting so the transaction stays active.
    const [metas, blobKeys, blobs, settings] = await Promise.all([
      reqResult(tx.objectStore(META).getAll() as IDBRequest<PhotoMeta[]>),
      reqResult(tx.objectStore(BLOBS).getAllKeys() as IDBRequest<string[]>),
      reqResult(tx.objectStore(BLOBS).getAll() as IDBRequest<File[]>),
      reqResult(
        tx.objectStore(SETTINGS).get('current') as IDBRequest<
          SettingsSnapshot | undefined
        >,
      ),
    ])

    const fileById = new Map<string, File>()
    blobKeys.forEach((key, i) => fileById.set(key, blobs[i]))

    const photos: Photo[] = []
    for (const meta of [...metas].sort((a, b) => a.order - b.order)) {
      const file = fileById.get(meta.id)
      if (!file) continue
      photos.push({
        id: meta.id,
        file,
        url: URL.createObjectURL(file),
        name: meta.name,
        size: meta.size,
        captionTop: meta.captionTop,
        captionBottom: meta.captionBottom,
        place: meta.place,
        crop: meta.crop ?? DEFAULT_CROP,
        orientation: meta.orientation ?? DEFAULT_ORIENTATION,
        enriching: false,
      })
    }
    return { photos, settings: settings ?? null }
  } catch {
    return { photos: [], settings: null }
  }
}

/**
 * Reconciles stored photos with the current set: writes blobs only for new
 * photos (so caption edits don't re-store megabytes), rewrites the small meta
 * records, and drops blobs for photos that were removed.
 */
export async function savePhotos(photos: Photo[]): Promise<void> {
  try {
    const db = await openDb()
    const readTx = db.transaction(BLOBS, 'readonly')
    const existingKeys = (await reqResult(
      readTx.objectStore(BLOBS).getAllKeys() as IDBRequest<string[]>,
    )) as string[]

    const existing = new Set(existingKeys)
    const currentIds = new Set(photos.map((p) => p.id))

    const tx = db.transaction([BLOBS, META], 'readwrite')
    const blobStore = tx.objectStore(BLOBS)
    const metaStore = tx.objectStore(META)
    metaStore.clear()
    photos.forEach((photo, order) => {
      if (!existing.has(photo.id)) blobStore.put(photo.file, photo.id)
      const meta: PhotoMeta = {
        id: photo.id,
        name: photo.name,
        size: photo.size,
        captionTop: photo.captionTop,
        captionBottom: photo.captionBottom,
        place: photo.place,
        crop: photo.crop,
        orientation: photo.orientation,
        order,
      }
      metaStore.put(meta, photo.id)
    })
    for (const key of existingKeys) {
      if (!currentIds.has(key)) blobStore.delete(key)
    }
    await txDone(tx)
  } catch {
    // Best-effort: a persistence failure must never break the editor.
  }
}

export async function saveSettings(settings: SettingsSnapshot): Promise<void> {
  try {
    const db = await openDb()
    const tx = db.transaction(SETTINGS, 'readwrite')
    tx.objectStore(SETTINGS).put(settings, 'current')
    await txDone(tx)
  } catch {
    // Best-effort.
  }
}
