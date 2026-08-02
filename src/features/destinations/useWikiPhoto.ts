import { useQuery } from '@tanstack/react-query';
import { commonsSearchUrl, pickPhotos } from './wikiPhoto';

/**
 * Fetch real scenic photos of a destination from Wikimedia Commons (no API key).
 * Returns an array of image URLs (empty on failure — the card just falls back to
 * no-photo). Cached aggressively; a place's photos don't change.
 */
export function useWikiPhotos(destinationName: string | undefined): string[] {
  const query = useQuery({
    queryKey: ['wiki-photos', destinationName],
    enabled: !!destinationName,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    queryFn: async (): Promise<string[]> => {
      const res = await fetch(commonsSearchUrl(destinationName as string), {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return [];
      return pickPhotos(await res.json());
    },
  });
  return query.data ?? [];
}

/** Convenience: just the first (lead) photo, or null. */
export function useWikiPhoto(destinationName: string | undefined): string | null {
  return useWikiPhotos(destinationName)[0] ?? null;
}
