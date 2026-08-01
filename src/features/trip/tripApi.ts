/**
 * Trip server state via react-query over the Amplify guest client. A trip is
 * addressed by its URL `slug`; opening a slug that doesn't exist yet creates it
 * (first visit). All reads/writes go through the identityPool (guest) default.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dataClient, unwrap, type TripRecord } from '../../lib/dataClient';
import { slugify } from './slug';

/** Look up a single trip by its unique slug (null when it doesn't exist yet). */
export async function fetchTripBySlug(slug: string): Promise<TripRecord | null> {
  const rows = unwrap(await dataClient.models.Trip.list({ filter: { slug: { eq: slug } } }));
  return rows[0] ?? null;
}

export const tripKeys = {
  bySlug: (slug: string) => ['trip', slug] as const,
};

/** Read the trip for a slug. `enabled` lets a caller defer until the slug is known. */
export function useTrip(slug: string) {
  return useQuery({
    queryKey: tripKeys.bySlug(slug),
    queryFn: () => fetchTripBySlug(slug),
    enabled: !!slug,
  });
}

/**
 * Get-or-create a trip for a slug. Returns the existing trip if present, else
 * creates one titled from `title` (or the slug). Used when the user opens or
 * starts a trip by URL. Seeds the trip query cache so the page renders at once.
 */
export function useEnsureTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, title }: { slug: string; title?: string }): Promise<TripRecord> => {
      const existing = await fetchTripBySlug(slug);
      if (existing) return existing;
      const created = unwrap(
        await dataClient.models.Trip.create({ slug, title: title?.trim() || slug }),
      );
      if (!created) throw new Error('Trip creation returned no record');
      return created;
    },
    onSuccess: (trip) => {
      qc.setQueryData(tripKeys.bySlug(trip.slug), trip);
    },
  });
}

export { slugify };
