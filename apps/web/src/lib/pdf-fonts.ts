import fontkit from '@pdf-lib/fontkit'
import { type PDFDocument, type PDFFont } from 'pdf-lib'

import indieFlowerUrl from '@/fonts/IndieFlower-Regular.ttf?url'
import kalamUrl from '@/fonts/Kalam-Regular.ttf?url'
import patrickHandUrl from '@/fonts/PatrickHand-Regular.ttf?url'
import shadowsUrl from '@/fonts/ShadowsIntoLight-Regular.ttf?url'

// Static TTFs for the handwriting caption fonts, so the exported PDF matches the
// on-screen preview. We embed the FULL font (no subsetting): pdf-lib's subsetter
// drops glyphs for some of these — Kalam came out as scattered half-words — and
// the size cost is trivial next to the 300-DPI photos. Connected scripts that
// rely on GPOS kerning pdf-lib lacks (e.g. Caveat) are still excluded (see #23).
const PDF_FONT_URLS: Record<string, string> = {
  'indie-flower': indieFlowerUrl,
  'patrick-hand': patrickHandUrl,
  'shadows-into-light': shadowsUrl,
  kalam: kalamUrl,
}

const bytesCache = new Map<string, Promise<ArrayBuffer>>()

function fontBytes(url: string): Promise<ArrayBuffer> {
  let pending = bytesCache.get(url)
  if (!pending) {
    pending = fetch(url).then((response) => response.arrayBuffer())
    bytesCache.set(url, pending)
  }
  return pending
}

/**
 * Embeds (subsetted) the handwriting TTF for `fontId`, or returns null so the
 * caller can fall back to a standard font.
 */
export async function embedCaptionFont(
  doc: PDFDocument,
  fontId: string,
): Promise<PDFFont | null> {
  const url = PDF_FONT_URLS[fontId]
  if (!url) return null
  try {
    doc.registerFontkit(fontkit)
    return await doc.embedFont(await fontBytes(url), { subset: false })
  } catch {
    return null
  }
}
