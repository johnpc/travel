/**
 * Pure parser for Claude's forced `estimate_budget` tool output → a typed rough
 * estimate. Kept pure so malformed/partial responses are unit-tested without
 * AWS. Missing numbers come back null; a bad payload yields all-null.
 */
export interface BudgetEstimate {
  flightPerPerson: number | null;
  lodgingPerNight: number | null;
  nights: number | null;
  seasonNote: string | null;
}

interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}

const posInt = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : null;
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

function toolInput(body: unknown): Record<string, unknown> | null {
  const content = (body as { content?: ContentBlock[] })?.content;
  if (!Array.isArray(content)) return null;
  const call = content.find((b) => b.type === 'tool_use' && b.name === 'estimate_budget');
  return call && typeof call.input === 'object' && call.input
    ? (call.input as Record<string, unknown>)
    : null;
}

/** Parse the response body into a clean rough estimate. */
export function parseBudget(body: unknown): BudgetEstimate {
  const o = toolInput(body) ?? {};
  return {
    flightPerPerson: posInt(o.flightPerPerson),
    lodgingPerNight: posInt(o.lodgingPerNight),
    nights: posInt(o.nights),
    seasonNote: str(o.seasonNote),
  };
}
