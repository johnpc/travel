/**
 * Pure parser for Claude's forced `suggest_hotels` tool output → typed hotel
 * picks + median Airbnb price. Kept pure so malformed responses are unit-tested
 * without AWS. Bad rows are dropped; tier is normalized to a known bucket.
 */
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

interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;
const posInt = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : null;

const TIERS = ['Budget', 'Mid-range', 'Luxury'];
const tierOf = (v: unknown): string => {
  const s = str(v);
  return s && TIERS.some((t) => t.toLowerCase() === s.toLowerCase())
    ? TIERS.find((t) => t.toLowerCase() === s.toLowerCase())!
    : 'Mid-range';
};

function toolInput(body: unknown): Record<string, unknown> | null {
  const content = (body as { content?: ContentBlock[] })?.content;
  if (!Array.isArray(content)) return null;
  const call = content.find((b) => b.type === 'tool_use' && b.name === 'suggest_hotels');
  return call && typeof call.input === 'object' && call.input
    ? (call.input as Record<string, unknown>)
    : null;
}

/** Parse the response body into clean hotel suggestions. */
export function parseHotels(body: unknown): HotelSuggestions {
  const input = toolInput(body) ?? {};
  const rows = Array.isArray(input.hotels) ? input.hotels : [];
  const hotels: HotelPick[] = [];
  for (const row of rows) {
    if (typeof row !== 'object' || row === null) continue;
    const o = row as Record<string, unknown>;
    const name = str(o.name);
    if (!name) continue;
    hotels.push({
      name,
      tier: tierOf(o.tier),
      pricePerNight: posInt(o.pricePerNight),
      area: str(o.area) ?? '',
      pros: str(o.pros) ?? '',
      cons: str(o.cons) ?? '',
    });
  }
  return { hotels, airbnbMedianPerNight: posInt(input.airbnbMedianPerNight) };
}
