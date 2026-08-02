/**
 * Pure builder for the Bedrock (Claude) request that estimates a rough trip
 * budget for a destination. Tool-forced structured output: a single
 * `estimate_budget` tool + tool_choice, so Claude returns exactly the typed
 * { flightPerPerson, lodgingPerNight, nights, seasonNote }. Unit-testable
 * without AWS. Amounts are whole USD; flights assume the group's home airport.
 */
export interface BudgetRequest {
  destinationName: string;
  /** IATA code of the group's home airport (origin for the flight estimate). */
  homeAirport: string;
}

const TOOL = {
  name: 'estimate_budget',
  description: 'Estimate a rough per-person trip budget for a destination.',
  input_schema: {
    type: 'object',
    properties: {
      flightPerPerson: {
        type: 'integer',
        description: 'Typical round-trip economy airfare per person, in whole USD.',
      },
      lodgingPerNight: {
        type: 'integer',
        description: 'Typical mid-range hotel/rental cost per night for the room, in whole USD.',
      },
      nights: {
        type: 'integer',
        description: 'A sensible number of nights for a trip to this destination.',
      },
      seasonNote: {
        type: 'string',
        description:
          'One short sentence on price/timing (e.g. "Shoulder season May–June is cheaper").',
      },
    },
    required: ['flightPerPerson', 'lodgingPerNight', 'nights', 'seasonNote'],
  },
};

/** Build the Anthropic-native Messages body for InvokeModel (tool-forced). */
export function buildBudgetRequest(req: BudgetRequest): string {
  const system = [
    'You estimate a rough, realistic trip budget for a group of friends planning travel.',
    `Give a typical round-trip economy airfare per person FROM ${req.homeAirport}, a mid-range`,
    'nightly lodging cost, and a sensible number of nights for this destination.',
    'These are ballpark starting numbers the group will verify and edit — reasonable, not precise.',
    'All amounts are whole US dollars. Call estimate_budget exactly once.',
  ].join('\n');
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1024,
    system,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content: `Destination: ${req.destinationName}` }],
  });
}
