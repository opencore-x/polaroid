export interface CaptionFont {
  id: string
  label: string
  /** CSS font-family stack applied to caption text. */
  stack: string
}

export const CAPTION_FONTS: CaptionFont[] = [
  { id: 'caveat', label: 'Caveat', stack: '"Caveat", cursive' },
  { id: 'patrick-hand', label: 'Patrick Hand', stack: '"Patrick Hand", cursive' },
  {
    id: 'shadows-into-light',
    label: 'Shadows Into Light',
    stack: '"Shadows Into Light", cursive',
  },
  { id: 'kalam', label: 'Kalam', stack: '"Kalam", cursive' },
]

export const DEFAULT_CAPTION_FONT_ID = CAPTION_FONTS[0].id

export function captionFontStack(id: string): string {
  return (
    CAPTION_FONTS.find((font) => font.id === id)?.stack ?? CAPTION_FONTS[0].stack
  )
}
