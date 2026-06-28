import { useEffect, useState } from 'react'

const IMAGE_EXT = /\.(jpe?g|png|webp|heic|heif)$/i

function isImage(file: File) {
  return file.type.startsWith('image/') || IMAGE_EXT.test(file.name)
}

function carriesFiles(event: DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files')
}

/**
 * Window-wide file drag-and-drop. Reports `dragging` the instant a file enters
 * the window (anywhere, not just over a drop box), and accepts a drop wherever
 * it lands — so the drop UI is available the moment you bring a photo to the app.
 */
export function useWindowFileDrop(onFiles: (files: File[]) => void) {
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    let depth = 0

    const onEnter = (event: DragEvent) => {
      if (!carriesFiles(event)) return
      depth += 1
      setDragging(true)
    }
    const onLeave = (event: DragEvent) => {
      if (!carriesFiles(event)) return
      depth -= 1
      if (depth <= 0) {
        depth = 0
        setDragging(false)
      }
    }
    const onOver = (event: DragEvent) => {
      if (carriesFiles(event)) event.preventDefault()
    }
    const onDrop = (event: DragEvent) => {
      if (!carriesFiles(event)) return
      event.preventDefault()
      depth = 0
      setDragging(false)
      const files = Array.from(event.dataTransfer?.files ?? []).filter(isImage)
      if (files.length > 0) onFiles(files)
    }

    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('dragover', onOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [onFiles])

  return dragging
}
