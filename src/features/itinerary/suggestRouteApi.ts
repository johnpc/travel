/**
 * AI multi-city route suggestions via the guest-callable suggestRoute mutation.
 * The resolver hands back a JSON string of ordered stops (Amplify custom types
 * don't nest arrays), parsed here. Not persisted — the user adds the stops they
 * like as ItineraryStop rows.
 */
import { useMutation } from '@tanstack/react-query';
import { dataClient, unwrap } from '../../lib/dataClient';

export interface RouteStop {
  place: string;
  nights: number | null;
  note: string;
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Parse the resolver's JSON payload into typed ordered stops (safe on garbage). */
export function parseRoutePayload(json: string | null | undefined): RouteStop[] {
  if (!json) return [];
  try {
    const rows = JSON.parse(json);
    if (!Array.isArray(rows)) return [];
    return rows
      .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
      .filter((r) => typeof r.place === 'string' && r.place.trim())
      .map((r) => ({
        place: String(r.place),
        nights: num(r.nights),
        note: typeof r.note === 'string' ? r.note : '',
      }));
  } catch {
    return [];
  }
}

/** Ask the AI for a multi-city route, excluding places already on the itinerary. */
export function useSuggestRoute() {
  return useMutation({
    mutationFn: async (args: { theme: string; exclude: string[] }): Promise<RouteStop[]> => {
      const result = await dataClient.mutations.suggestRoute({
        theme: args.theme,
        exclude: args.exclude,
      });
      return parseRoutePayload(unwrap(result)?.stops);
    },
  });
}
