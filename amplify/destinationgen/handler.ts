/**
 * suggestDestinations resolver. Guest-callable: builds a tool-forced Claude
 * request from the trip title (excluding names already on the trip), invokes
 * Bedrock, parses the structured output, and returns clean { name, blurb, why }
 * suggestions. Pure prompt/parse logic lives in ./shared; this handler is just
 * the glue + the Bedrock call.
 */
import { buildSuggestRequest } from './shared/suggestPrompt';
import { parseSuggestions } from './shared/parseSuggest';
import { invokeText } from './shared/bedrock';
import type { Schema } from '../data/resource';

type Args = Schema['suggestDestinations']['args'];

export const handler: Schema['suggestDestinations']['functionHandler'] = async (event) => {
  const { tripTitle, count, exclude } = event.arguments as Args;
  const body = buildSuggestRequest({
    tripTitle: tripTitle ?? '',
    count: count && count > 0 ? count : 5,
    exclude: (exclude ?? []).filter((s): s is string => !!s),
  });
  const suggestions = parseSuggestions(await invokeText(body));
  // Custom types don't nest arrays cleanly in Amplify — return JSON the client parses.
  return { suggestions: JSON.stringify(suggestions) };
};
