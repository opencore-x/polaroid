const captionDateFormat = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
})

/** Formats a capture date for a polaroid caption, e.g. "October 2008". */
export function formatCaptionDate(date: Date): string {
  return captionDateFormat.format(date)
}
