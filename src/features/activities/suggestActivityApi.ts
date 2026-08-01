/**
 * AI activity suggestions via the guest-callable suggestActivities mutation.
 * Returns parsed { title, blurb, category } — the resolver hands back a JSON
 * string (Amplify custom types don't nest arrays), parsed here. Not persisted;
 * the user accepts the ones they like.
 */
import { useMutation } from '@tanstack/react-query';
import { dataClient, unwrap } from '../../lib/dataClient';

export interface ActivitySuggestion {
  title: string;
  blurb: string;
  category: string;
}

/** Parse the resolver's JSON payload into typed suggestions (safe on garbage). */
export function parseActivityPayload(json: string | null | undefined): ActivitySuggestion[] {
  if (!json) return [];
  try {
    const rows = JSON.parse(json);
    if (!Array.isArray(rows)) return [];
    return rows.filter(
      (r): r is ActivitySuggestion =>
        !!r && typeof r.title === 'string' && typeof r.blurb === 'string',
    );
  } catch {
    return [];
  }
}

/** Ask the AI for activity ideas at a destination, excluding titles already listed. */
export function useSuggestActivities() {
  return useMutation({
    mutationFn: async (args: {
      destinationName: string;
      exclude: string[];
    }): Promise<ActivitySuggestion[]> => {
      const result = await dataClient.mutations.suggestActivities({
        destinationName: args.destinationName,
        count: 5,
        exclude: args.exclude,
      });
      return parseActivityPayload(unwrap(result)?.suggestions);
    },
  });
}
