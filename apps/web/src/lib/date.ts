export type DateFormat = 'monthYear' | 'fullDate' | 'year'

export const DATE_FORMATS: { id: DateFormat; label: string }[] = [
  { id: 'monthYear', label: 'Month Year' },
  { id: 'fullDate', label: 'Full date' },
  { id: 'year', label: 'Year' },
]

export const DEFAULT_DATE_FORMAT: DateFormat = 'monthYear'

const formatters: Record<DateFormat, Intl.DateTimeFormat> = {
  monthYear: new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }),
  fullDate: new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  year: new Intl.DateTimeFormat(undefined, { year: 'numeric' }),
}

/** Formats a capture date for a polaroid caption, e.g. "October 2008". */
export function formatCaptionDate(
  date: Date,
  format: DateFormat = DEFAULT_DATE_FORMAT,
): string {
  return formatters[format].format(date)
}

/** True if `text` is any auto-generated date string for this capture time. */
export function isAutoDate(text: string, takenAt: number | undefined): boolean {
  if (!text || takenAt == null) return false
  const date = new Date(takenAt)
  return DATE_FORMATS.some(({ id }) => formatCaptionDate(date, id) === text)
}
