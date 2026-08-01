/**
 * AI destination suggestions via the guest-callable suggestDestinations
 * mutation. Returns parsed { name, blurb, why } suggestions — the resolver hands
 * back a JSON string (Amplify custom types don't nest arrays), which we parse
 * here. Suggestions are NOT persisted; the user accepts the ones they like.
 */
import { useMutation } from '@tanstack/react-query';
import { dataClient, unwrap } from '../../lib/dataClient';

export interface Suggestion {
  name: string;
  blurb: string;
  why: string;
}

/** Parse the resolver's JSON payload into typed suggestions (safe on garbage). */
export function parseSuggestionPayload(json: string | null | undefined): Suggestion[] {
  if (!json) return [];
  try {
    const rows = JSON.parse(json);
    if (!Array.isArray(rows)) return [];
    return rows.filter(
      (r): r is Suggestion =>
        !!r &&
        typeof r.name === 'string' &&
        typeof r.blurb === 'string' &&
        typeof r.why === 'string',
    );
  } catch {
    return [];
  }
}

/** Ask the AI for destination ideas for a trip, excluding names already added. */
export function useSuggestDestinations() {
  return useMutation({
    mutationFn: async (args: { tripTitle: string; exclude: string[] }): Promise<Suggestion[]> => {
      const result = await dataClient.mutations.suggestDestinations({
        tripTitle: args.tripTitle,
        count: 5,
        exclude: args.exclude,
      });
      const data = unwrap(result);
      return parseSuggestionPayload(data?.suggestions);
    },
  });
}
