/**
 * suggestActivities resolver. Guest-callable: builds a tool-forced Claude request
 * for a destination (excluding activities already listed), invokes Bedrock,
 * parses the structured output, and returns clean { title, blurb, category } as
 * a JSON string (Amplify custom types don't nest arrays). Pure logic lives in
 * ./shared; the Bedrock invoke is shared with destinationgen.
 */
import { buildActivityRequest } from './shared/activityPrompt';
import { parseActivities } from './shared/parseActivities';
import { invokeText } from '../destinationgen/shared/bedrock';
import type { Schema } from '../data/resource';

type Args = Schema['suggestActivities']['args'];

export const handler: Schema['suggestActivities']['functionHandler'] = async (event) => {
  const { destinationName, count, exclude } = event.arguments as Args;
  const body = buildActivityRequest({
    destinationName,
    count: count && count > 0 ? count : 5,
    exclude: (exclude ?? []).filter((s): s is string => !!s),
  });
  const suggestions = parseActivities(await invokeText(body));
  return { suggestions: JSON.stringify(suggestions) };
};
