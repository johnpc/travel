/**
 * Pure helpers for fetching REAL scenic photos of a destination from Wikimedia
 * Commons (free, no API key, actual licensed photos). We search Commons for the
 * place rather than using the Wikipedia infobox image, because the infobox is
 * often a LOCATOR MAP — useless for "show me the place". `wikiTitle` extracts the
 * place; `commonsSearchUrl` builds the query; `pickPhotos` parses + filters the
 * results into scenic photo URLs (dropping maps/flags/diagrams/SVGs). Pure so
 * they're unit-tested without network.
 */
export function wikiTitle(destinationName: string): string {
  return destinationName.split(',')[0].trim();
}

/** Commons image-search for scenic photos of the destination (up to `limit`). */
export function commonsSearchUrl(destinationName: string, limit = 8): string {
  const q = encodeURIComponent(wikiTitle(destinationName));
  return (
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=${limit}` +
    `&prop=imageinfo&iiprop=url&iiurlwidth=1000`
  );
}

// Filenames that aren't scenic photos of the place.
const JUNK = /(\.svg|\.pdf|map|locator|flag|coat.of.arms|logo|diagram|chart|seal|icon)/i;

interface Page {
  title?: string;
  index?: number;
  imageinfo?: { thumburl?: string; url?: string }[];
}

/** Parse a Commons search payload into clean scenic photo URLs (search order). */
export function pickPhotos(payload: unknown): string[] {
  const pages = (payload as { query?: { pages?: Record<string, Page> } })?.query?.pages;
  if (!pages) return [];
  return Object.values(pages)
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .filter((p) => !JUNK.test(p.title ?? ''))
    .map((p) => p.imageinfo?.[0]?.thumburl ?? p.imageinfo?.[0]?.url)
    .filter((u): u is string => !!u && !JUNK.test(u));
}
