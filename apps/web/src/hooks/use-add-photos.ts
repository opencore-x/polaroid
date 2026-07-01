import { type ChangeEvent, useCallback, useRef } from "react";

import { usePhotoStore } from "@/stores/photo-store";

/**
 * Shared wiring for every "add photos" affordance (sidebar button, hero CTA,
 * mobile FAB, filmstrip tile): a hidden file input plus an `open()` trigger.
 * Render the input with {@link PHOTO_ACCEPT} and spread `inputRef`/`onChange`.
 */
export function useAddPhotos() {
  const addFiles = usePhotoStore((state) => state.addFiles);
  const inputRef = useRef<HTMLInputElement>(null);

  const open = useCallback(() => inputRef.current?.click(), []);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      if (files.length > 0) addFiles(files);
      event.target.value = "";
    },
    [addFiles],
  );

  return { inputRef, open, onChange };
}
