/**
 * AI rough-budget estimate via the guest-callable estimateBudget mutation. The
 * resolver hands back a JSON string (Amplify custom types don't nest cleanly),
 * parsed here into a typed estimate. Not persisted — the client seeds the
 * editable budget fields with it and the group verifies/saves.
 */
import { useMutation } from '@tanstack/react-query';
import { dataClient, unwrap } from '../../lib/dataClient';

export interface BudgetEstimate {
  flightPerPerson: number | null;
  lodgingPerNight: number | null;
  nights: number | null;
  seasonNote: string | null;
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v : null);

/** Parse the resolver's JSON payload into a typed estimate (safe on garbage). */
export function parseBudgetPayload(json: string | null | undefined): BudgetEstimate {
  if (!json)
    return { flightPerPerson: null, lodgingPerNight: null, nights: null, seasonNote: null };
  try {
    const o = JSON.parse(json) as Record<string, unknown>;
    return {
      flightPerPerson: num(o.flightPerPerson),
      lodgingPerNight: num(o.lodgingPerNight),
      nights: num(o.nights),
      seasonNote: str(o.seasonNote),
    };
  } catch {
    return { flightPerPerson: null, lodgingPerNight: null, nights: null, seasonNote: null };
  }
}

/** Ask the AI for a rough budget estimate for a destination (flights from DTW). */
export function useEstimateBudget() {
  return useMutation({
    mutationFn: async (args: { destinationName: string }): Promise<BudgetEstimate> => {
      const result = await dataClient.mutations.estimateBudget({
        destinationName: args.destinationName,
      });
      return parseBudgetPayload(unwrap(result)?.estimate);
    },
  });
}
