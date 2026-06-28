# Polaroid

Arrange photos polaroid-style with **EXIF auto-captions** (city + date) and tile them onto **A4 sheets** for print-at-home. Private, client-side, free.

No upload, no account, no watermark — everything runs in your browser.

## Why

Existing tools each do a piece, but none combine all four:

- **EXIF auto-captions** — city + date filled in automatically (Canva makes you type every caption)
- **Smart A4 nesting** — maximize polaroids per sheet, with cut/crop marks for clean trimming
- **Private & client-side** — photos never leave your device
- **Free & open source**

Print on a home inkjet (e.g. Canon G1010), cut along the guides, done. Output is **sRGB** — what photo labs, print-on-demand, and home printers actually want (CMYK is deliberately not used; it produces worse results on these targets).

## Stack

- **Build:** Vite 8 (Rolldown)
- **App:** React 19 SPA + TanStack Router (file-based, type-safe)
- **Language:** TypeScript 7
- **Styling:** Tailwind v4 + shadcn/ui
- **Canvas:** Konva / react-konva (planned)
- **EXIF:** exifr (planned) · **PDF:** pdf-lib (planned)

## Monorepo

```
apps/web/        React SPA (the app)
packages/        shared code (future)
```

Mobile (`apps/mobile`) may be added later.

## Develop

```bash
pnpm install
pnpm dev          # all apps via Turborepo
pnpm build
pnpm lint
pnpm typecheck
```

The web app alone:

```bash
pnpm --filter @polaroid/web dev
```

## Roadmap

Tracked in [GitHub Issues](https://github.com/opencore-x/polaroid/issues) across two milestones: **Phase 1 — MVP** (upload → polaroid + EXIF captions → smart A4 tiling → sRGB PDF) and **Phase 2 — Polish** (multipage, drag-reorder, responsive).

## License

MIT
