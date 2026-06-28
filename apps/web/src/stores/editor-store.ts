import { create } from 'zustand'

// Which frame is currently being edited on the sheet. Kept separate from the
// photo store so selecting a frame doesn't re-render every photo consumer.
interface EditorState {
  selectedId: string | null
  select: (id: string | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedId: null,
  select: (id) => set({ selectedId: id }),
}))
