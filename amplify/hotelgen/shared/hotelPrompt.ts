/**
 * Pure builder for the Bedrock (Claude) request that suggests where to stay at a
 * destination — a spread of real, well-known hotels across price tiers, plus a
 * ballpark median Airbnb nightly price for the area. Tool-forced structured
 * output (single `suggest_hotels` tool + tool_choice) so Claude returns exactly
 * the typed shape. Unit-testable without AWS. We ask for REAL, recognizable
 * properties so the client's Booking.com/Maps SEARCH links resolve to them.
 */
export interface HotelRequest {
  destinationName: string;
}

const TOOL = {
  name: 'suggest_hotels',
  description: 'Suggest real places to stay at a destination across price tiers.',
  input_schema: {
    type: 'object',
    properties: {
      hotels: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Real, recognizable hotel/property name.' },
            tier: {
              type: 'string',
              description: 'One of: Budget, Mid-range, Luxury',
            },
            pricePerNight: {
              type: 'integer',
              description: 'Typical nightly rate for the room, in whole USD.',
            },
            area: { type: 'string', description: 'Neighborhood/area, e.g. "Oia" or "Old Town".' },
            pros: { type: 'string', description: 'One short sentence on what makes it great.' },
            cons: { type: 'string', description: 'One short honest downside/tradeoff.' },
          },
          required: ['name', 'tier', 'pricePerNight', 'area', 'pros', 'cons'],
        },
      },
      airbnbMedianPerNight: {
        type: 'integer',
        description: 'Rough median Airbnb nightly price for a whole place in the area, whole USD.',
      },
    },
    required: ['hotels', 'airbnbMedianPerNight'],
  },
};

/** Build the Anthropic-native Messages body for InvokeModel (tool-forced). */
export function buildHotelRequest(req: HotelRequest): string {
  const system = [
    'You recommend where to stay for a group of friends planning a trip.',
    'Suggest exactly 3 REAL, well-known, currently-operating properties: one Budget, one Mid-range,',
    'one Luxury — so the group can compare tradeoffs. Use real property names a search will find.',
    'Give a realistic nightly rate, the neighborhood, one genuine pro and one honest con for each.',
    'Also give a rough median nightly Airbnb price for a whole place in the area.',
    'All prices are whole US dollars, ballpark. Call suggest_hotels exactly once.',
  ].join('\n');
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2048,
    system,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content: `Destination: ${req.destinationName}` }],
  });
}
