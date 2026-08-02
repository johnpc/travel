/**
 * AI hotel suggestions via the guest-callable suggestHotels mutation. The
 * resolver hands back a JSON string (Amplify custom types don't nest arrays),
 * parsed here into typed picks across price tiers + a median Airbnb price. Not
 * persisted — a lookup to help the group decide where to stay.
 */
import { useMutation } from '@tanstack/react-query';
import { dataClient, unwrap } from '../../lib/dataClient';

export interface HotelPick {
  name: string;
  tier: string;
  pricePerNight: number | null;
  area: string;
  pros: string;
  cons: string;
}

export interface HotelSuggestions {
  hotels: HotelPick[];
  airbnbMedianPerNight: number | null;
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const s = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Parse the resolver's JSON payload into typed suggestions (safe on garbage). */
export function parseHotelPayload(json: string | null | undefined): HotelSuggestions {
  if (!json) return { hotels: [], airbnbMedianPerNight: null };
  try {
    const o = JSON.parse(json) as { hotels?: unknown; airbnbMedianPerNight?: unknown };
    const rows = Array.isArray(o.hotels) ? o.hotels : [];
    const hotels: HotelPick[] = rows
      .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
      .filter((r) => typeof r.name === 'string' && r.name.trim())
      .map((r) => ({
        name: s(r.name),
        tier: s(r.tier) || 'Mid-range',
        pricePerNight: num(r.pricePerNight),
        area: s(r.area),
        pros: s(r.pros),
        cons: s(r.cons),
      }));
    return { hotels, airbnbMedianPerNight: num(o.airbnbMedianPerNight) };
  } catch {
    return { hotels: [], airbnbMedianPerNight: null };
  }
}

/** Ask the AI for hotel picks across tiers (+ median Airbnb) for a destination. */
export function useSuggestHotels() {
  return useMutation({
    mutationFn: async (args: { destinationName: string }): Promise<HotelSuggestions> => {
      const result = await dataClient.mutations.suggestHotels({
        destinationName: args.destinationName,
      });
      return parseHotelPayload(unwrap(result)?.suggestions);
    },
  });
}
