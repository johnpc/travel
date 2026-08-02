import { useQuery } from '@tanstack/react-query';
import { commonsSearchUrl, pickPhotos } from './wikiPhoto';

/**
 * Fetch real scenic photos of a destination from Wikimedia Commons (no API key).
 * Returns the URLs plus `settled` — true once the search has finished, so a
 * caller can tell "still loading" apart from "done, no photo found" (a freeform
 * name like "Zambia safari" has no Commons match) and show a real placeholder
 * instead of a permanent empty box. Cached forever; a place's photos don't move.
 */
export function useWikiPhotosState(destinationName: string | undefined): {
  photos: string[];
  settled: boolean;
} {
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
  return { photos: query.data ?? [], settled: !!destinationName && query.isFetched };
}

/** Convenience: just the photo URLs (empty while loading or on no match). */
export function useWikiPhotos(destinationName: string | undefined): string[] {
  return useWikiPhotosState(destinationName).photos;
}

/** Convenience: just the first (lead) photo, or null. */
export function useWikiPhoto(destinationName: string | undefined): string | null {
  return useWikiPhotos(destinationName)[0] ?? null;
}
