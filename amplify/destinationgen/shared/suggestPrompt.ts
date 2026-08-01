/**
 * Pure builder for the Bedrock (Claude) request that suggests group-trip
 * destinations. Tool-forced structured output: a single `suggest_destinations`
 * tool + tool_choice, so Claude must return exactly the typed array of
 * { name, blurb, why }. Kept separate from the network call so it's unit-testable
 * without AWS.
 */
export interface SuggestRequest {
  /** The trip's title, used as loose context (e.g. "Greece 2027"). */
  tripTitle: string;
  /** How many suggestions to ask for. */
  count: number;
  /** Destination names already on the trip, so the model doesn't repeat them. */
  exclude: string[];
}

const TOOL = {
  name: 'suggest_destinations',
  description: 'Suggest travel destinations for a group trip.',
  input_schema: {
    type: 'object',
    properties: {
      destinations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Destination name, e.g. "Santorini, Greece"' },
            blurb: { type: 'string', description: 'One vivid sentence describing the place.' },
            why: { type: 'string', description: 'One sentence on why it suits a group trip.' },
          },
          required: ['name', 'blurb', 'why'],
        },
      },
    },
    required: ['destinations'],
  },
};

/** Build the Anthropic-native Messages body for InvokeModel (tool-forced). */
export function buildSuggestRequest(req: SuggestRequest): string {
  const system = [
    'You suggest travel destinations for a group of friends (a few couples) planning a trip together.',
    `Suggest exactly ${req.count} distinct, real, appealing destinations.`,
    'Favor places that work well for a group: a mix of relaxation, sights, food, and shared activities.',
    req.exclude.length
      ? `Do NOT suggest any of these already-listed places: ${req.exclude.join(', ')}.`
      : '',
    'Keep blurb and why to a single sentence each. Call suggest_destinations exactly once.',
  ]
    .filter(Boolean)
    .join('\n');
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2048,
    system,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content: `Trip: ${req.tripTitle || 'a group getaway'}` }],
  });
}
