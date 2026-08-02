/**
 * Pure builder for the Bedrock (Claude) request that suggests a multi-city route
 * — an ordered set of stops with nights each, like Tokyo → Angkor Wat → Bangkok
 * → Phuket. Tool-forced structured output (single `suggest_route` tool +
 * tool_choice) so Claude returns exactly the typed ordered stops. Unit-testable
 * without AWS. The `theme` is the trip's title/vibe (e.g. "Southeast Asia 3
 * weeks"); excludes stops already on the itinerary so it complements them.
 */
export interface RouteRequest {
  theme: string;
  /** Places already on the itinerary, so the model doesn't repeat them. */
  exclude: string[];
}

const TOOL = {
  name: 'suggest_route',
  description: 'Suggest an ordered multi-city travel route with nights per stop.',
  input_schema: {
    type: 'object',
    properties: {
      stops: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            place: { type: 'string', description: 'City/place name, e.g. "Bangkok, Thailand".' },
            nights: { type: 'integer', description: 'Suggested nights at this stop.' },
            note: { type: 'string', description: 'One short sentence on why it fits the route.' },
          },
          required: ['place', 'nights', 'note'],
        },
      },
    },
    required: ['stops'],
  },
};

/** Build the Anthropic-native Messages body for InvokeModel (tool-forced). */
export function buildRouteRequest(req: RouteRequest): string {
  const system = [
    'You plan multi-city trips for a group of friends — an ordered route of stops that flow well',
    'geographically (minimal backtracking) with a sensible number of nights at each.',
    'Suggest 3–5 stops in travel order. Keep each note to one sentence.',
    req.exclude.length
      ? `The itinerary already includes: ${req.exclude.join(', ')} — COMPLEMENT these (don't repeat), ordering the whole route sensibly.`
      : '',
    'Call suggest_route exactly once.',
  ]
    .filter(Boolean)
    .join('\n');
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1536,
    system,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content: `Trip: ${req.theme}` }],
  });
}
