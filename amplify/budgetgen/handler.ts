/**
 * estimateBudget resolver. Guest-callable: builds a tool-forced Claude request
 * for a destination (flights from the group's home airport), invokes Bedrock,
 * parses the structured output, and returns the rough estimate as a JSON string
 * (Amplify custom types don't nest cleanly). It does NOT persist — the client
 * seeds the editable budget fields with it and the group verifies/saves. Pure
 * logic lives in ./shared; the Bedrock invoke is shared with destinationgen.
 */
import { buildBudgetRequest } from './shared/budgetPrompt';
import { parseBudget } from './shared/parseBudget';
import { invokeText } from '../destinationgen/shared/bedrock';
import type { Schema } from '../data/resource';

type Args = Schema['estimateBudget']['args'];

export const handler: Schema['estimateBudget']['functionHandler'] = async (event) => {
  const { destinationName, homeAirport } = event.arguments as Args;
  const body = buildBudgetRequest({
    destinationName,
    homeAirport: homeAirport && homeAirport.trim() ? homeAirport.trim() : 'DTW',
  });
  const estimate = parseBudget(await invokeText(body));
  return { estimate: JSON.stringify(estimate) };
};
