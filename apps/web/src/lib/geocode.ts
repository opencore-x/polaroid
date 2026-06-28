export interface PlaceName {
  city: string
  country: string
  countryIso2: string
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
