/**
 * Pure parser for Claude's forced `suggest_route` tool output → typed ordered
 * stops. Kept pure so malformed responses are unit-tested without AWS. Bad rows
 * are dropped; order is preserved from the array.
 */
export interface RouteStop {
  place: string;
  nights: number | null;
  note: string;
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

function toolInput(body: unknown): Record<string, unknown> | null {
  const content = (body as { content?: ContentBlock[] })?.content;
  if (!Array.isArray(content)) return null;
  const call = content.find((b) => b.type === 'tool_use' && b.name === 'suggest_route');
  return call && typeof call.input === 'object' && call.input
    ? (call.input as Record<string, unknown>)
    : null;
}

/** Parse the response body into clean ordered route stops. */
export function parseRoute(body: unknown): RouteStop[] {
  const rows = toolInput(body)?.stops;
  if (!Array.isArray(rows)) return [];
  const out: RouteStop[] = [];
  for (const row of rows) {
    if (typeof row !== 'object' || row === null) continue;
    const o = row as Record<string, unknown>;
    const place = str(o.place);
    if (!place) continue;
    out.push({ place, nights: posInt(o.nights), note: str(o.note) ?? '' });
  }
  return out;
}
