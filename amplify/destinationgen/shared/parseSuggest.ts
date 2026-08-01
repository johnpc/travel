/**
 * Pure parser for Claude's forced `suggest_destinations` tool output → typed
 * suggestions. Kept pure so malformed responses are unit-tested without AWS.
 * Bad rows are dropped; the caller validates the final list.
 */
export interface Suggestion {
  name: string;
  blurb: string;
  why: string;
}

interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

/** Extract the tool-call input from a Bedrock/Anthropic messages response. */
function toolInput(body: unknown): Record<string, unknown> | null {
  const content = (body as { content?: ContentBlock[] })?.content;
  if (!Array.isArray(content)) return null;
  const call = content.find((b) => b.type === 'tool_use' && b.name === 'suggest_destinations');
  return call && typeof call.input === 'object' && call.input
    ? (call.input as Record<string, unknown>)
    : null;
}

/** Parse the response body into clean suggestions (dropping malformed rows). */
export function parseSuggestions(body: unknown): Suggestion[] {
  const input = toolInput(body);
  const rows = input?.destinations;
  if (!Array.isArray(rows)) return [];
  const out: Suggestion[] = [];
  for (const row of rows) {
    if (typeof row !== 'object' || row === null) continue;
    const o = row as Record<string, unknown>;
    const name = str(o.name);
    const blurb = str(o.blurb);
    const why = str(o.why);
    if (name && blurb && why) out.push({ name, blurb, why });
  }
  return out;
}
