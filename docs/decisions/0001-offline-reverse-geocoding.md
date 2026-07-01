# ADR 0001 — Offline reverse-geocoding for EXIF captions

**Status:** Accepted (2026-06-28)

## Context

Rewind Card captions auto-fill the city from a photo's EXIF GPS (#4). Resolving
GPS → city name can be done two ways:

- **Online API** (Nominatim, Google, etc.) — accurate, but sends every photo's
  coordinates to a third party.
- **Offline dataset** — bundled cities, nearest-neighbour lookup, fully local.

The app's core promise is _"private, client-side, never uploaded"_. Sending
coordinates to a geocoding API silently breaks that promise.

## Decision

**Offline-first.** Use
[`offline-geocode-city`](https://www.npmjs.com/package/offline-geocode-city) — a
bundled cities dataset (~1.7 MB) exposing `getNearestCity(lat, lon)` →
`{ cityName, countryName, countryIso2 }`. It runs entirely in the browser;
coordinates never leave the device.

To keep the initial bundle small, the dataset is **lazy-loaded** (dynamic
`import()`) only when the first GPS-tagged photo needs geocoding.

## Consequences

- City accuracy is "nearest sizable city", not street-level — fine for captions.
- No network, no API keys, no rate limits, no privacy leak.
- If higher accuracy is ever wanted, an **opt-in** online lookup (off by
  default, clearly disclosed) can be added later — never silent.
