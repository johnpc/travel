/**
 * suggestRoute resolver. Guest-callable: builds a tool-forced Claude request for
 * a multi-city route (excluding stops already on the itinerary), invokes Bedrock,
 * parses the ordered stops, and returns them as a JSON string (Amplify custom
 * types don't nest arrays). It does NOT persist — the client shows the route and
 * the user adds the stops they like as ItineraryStop rows. Pure logic in
 * ./shared; the Bedrock invoke is shared with destinationgen.
 */
import { buildRouteRequest } from './shared/routePrompt';
import { parseRoute } from './shared/parseRoute';
import { invokeText } from '../destinationgen/shared/bedrock';
import type { Schema } from '../data/resource';

type Args = Schema['suggestRoute']['args'];

export const handler: Schema['suggestRoute']['functionHandler'] = async (event) => {
  const { theme, exclude } = event.arguments as Args;
  const body = buildRouteRequest({
    theme: theme ?? 'a multi-city trip',
    exclude: (exclude ?? []).filter((s): s is string => !!s),
  });
  const stops = parseRoute(await invokeText(body));
  return { stops: JSON.stringify(stops) };
};
