export interface PlaceName {
  city: string
  country: string
  countryIso2: string
}

export type Place = { city: string; country: string }

// How much of the resolved place to show. The offline dataset only knows city
// and country, so finer levels (neighborhood) aren't offered — see #39.
export type LocationDetail = 'country' | 'city' | 'cityCountry'

export const LOCATION_DETAILS: { id: LocationDetail; label: string }[] = [
  { id: 'country', label: 'Country' },
  { id: 'city', label: 'City' },
  { id: 'cityCountry', label: 'City, Country' },
]

export function placeLabel(place: Place, detail: LocationDetail): string {
  if (detail === 'country') return place.country
  if (detail === 'cityCountry') return `${place.city}, ${place.country}`
  return place.city
}

/** True if `text` is any auto-generated location label for this place. */
export function isAutoLocation(text: string, place: Place): boolean {
  return (
    text === '' ||
    LOCATION_DETAILS.some(({ id }) => placeLabel(place, id) === text)
  )
}

// The cities dataset (~1.7 MB) is lazy-loaded on first use so it never bloats
// the initial bundle. Everything runs locally — coordinates never leave the
// device (see docs/decisions/0001-offline-reverse-geocoding.md).
let loader: Promise<typeof import('offline-geocode-city')> | null = null

function loadGeocoder() {
  loader ??= import('offline-geocode-city')
  return loader
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<PlaceName | null> {
  try {
    const { getNearestCity } = await loadGeocoder()
    const result = await getNearestCity(latitude, longitude)
    if (!result?.cityName) return null
    return {
      city: result.cityName,
      country: result.countryName,
      countryIso2: result.countryIso2,
    }
  } catch {
    return null
  }
}
