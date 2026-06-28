import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { downloadProject, importProject } from '@/lib/project'
import { usePhotoStore } from '@/stores/photo-store'
import { settingsSnapshot, useSettingsStore } from '@/stores/settings-store'

export function ProjectControls() {
  const photos = usePhotoStore((state) => state.photos)
  const replaceAll = usePhotoStore((state) => state.replaceAll)
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setBusy(true)
    try {
      await downloadProject(
        photos,
        settingsSnapshot(useSettingsStore.getState()),
      )
    } finally {
      setBusy(false)
    }
  }

  const handleOpen = async (file: File) => {
    setBusy(true)
    setError(null)
    try {
      const { photos: imported, settings } = await importProject(file)
      replaceAll(imported)
      useSettingsStore.setState(settings)
    } catch {
      setError('Could not open that project file.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleOpen(file)
            event.target.value = ''
          }}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-3.5" />
          Open
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || photos.length === 0}
          onClick={() => void handleSave()}
        >
          <Download className="size-3.5" />
          Save
        </Button>
      </div>
      {error && <span className="text-destructive text-xs">{error}</span>}
    </div>
  )
}
