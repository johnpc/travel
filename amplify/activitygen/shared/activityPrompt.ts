/**
 * Pure builder for the Bedrock (Claude) request that suggests things to do at a
 * destination. Tool-forced structured output: a single `suggest_activities`
 * tool + tool_choice, so Claude returns exactly the typed array of
 * { title, blurb, category }. Unit-testable without AWS.
 */
export interface ActivityRequest {
  destinationName: string;
  count: number;
  /** Activity titles already listed, so the model doesn't repeat them. */
  exclude: string[];
}

const TOOL = {
  name: 'suggest_activities',
  description: 'Suggest things to do at a travel destination.',
  input_schema: {
    type: 'object',
    properties: {
      activities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Short activity name, e.g. "Sunset catamaran cruise"',
            },
            blurb: { type: 'string', description: 'One vivid sentence on what it is.' },
            category: {
              type: 'string',
              description:
                'One of: Sightseeing, Food & Drink, Outdoors, Culture, Nightlife, Relaxation',
            },
          },
          required: ['title', 'blurb', 'category'],
        },
      },
    },
    required: ['activities'],
  },
};

/** Build the Anthropic-native Messages body for InvokeModel (tool-forced). */
export function buildActivityRequest(req: ActivityRequest): string {
  const system = [
    'You suggest things to do at a travel destination for a group of friends on a trip together.',
    `Suggest exactly ${req.count} distinct, real, appealing activities you'd find on GetYourGuide or Airbnb Experiences.`,
    'Favor a spread across categories (sightseeing, food, outdoors, culture, nightlife, relaxation).',
    req.exclude.length
      ? `Do NOT repeat any of these already-listed activities: ${req.exclude.join(', ')}.`
      : '',
    'Keep each blurb to a single sentence. Call suggest_activities exactly once.',
  ]
    .filter(Boolean)
    .join('\n');
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2048,
    system,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content: `Destination: ${req.destinationName}` }],
  });
}
