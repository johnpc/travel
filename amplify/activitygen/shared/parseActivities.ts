/**
 * Pure parser for Claude's forced `suggest_activities` tool output → typed
 * activities. Kept pure so malformed responses are unit-tested without AWS.
 * Bad rows are dropped.
 */
export interface ActivitySuggestion {
  title: string;
  blurb: string;
  category: string;
}

interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

function toolInput(body: unknown): Record<string, unknown> | null {
  const content = (body as { content?: ContentBlock[] })?.content;
  if (!Array.isArray(content)) return null;
  const call = content.find((b) => b.type === 'tool_use' && b.name === 'suggest_activities');
  return call && typeof call.input === 'object' && call.input
    ? (call.input as Record<string, unknown>)
    : null;
}

/** Parse the response body into clean activity suggestions. */
export function parseActivities(body: unknown): ActivitySuggestion[] {
  const rows = toolInput(body)?.activities;
  if (!Array.isArray(rows)) return [];
  const out: ActivitySuggestion[] = [];
  for (const row of rows) {
    if (typeof row !== 'object' || row === null) continue;
    const o = row as Record<string, unknown>;
    const title = str(o.title);
    const blurb = str(o.blurb);
    const category = str(o.category) ?? 'Other';
    if (title && blurb) out.push({ title, blurb, category });
  }
  return out;
}
