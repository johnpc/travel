/**
 * suggestHotels resolver. Guest-callable: builds a tool-forced Claude request for
 * a destination, invokes Bedrock, parses the structured output, and returns
 * { hotels[], airbnbMedianPerNight } as a JSON string (Amplify custom types
 * don't nest arrays). It does NOT persist — the client shows the picks with
 * Booking.com/Maps SEARCH links (which resolve to the real property + its real
 * photos). Pure logic in ./shared; Bedrock invoke shared with destinationgen.
 */
import { buildHotelRequest } from './shared/hotelPrompt';
import { parseHotels } from './shared/parseHotels';
import { invokeText } from '../destinationgen/shared/bedrock';
import type { Schema } from '../data/resource';

type Args = Schema['suggestHotels']['args'];

export const handler: Schema['suggestHotels']['functionHandler'] = async (event) => {
  const { destinationName } = event.arguments as Args;
  const body = buildHotelRequest({ destinationName });
  const suggestions = parseHotels(await invokeText(body));
  return { suggestions: JSON.stringify(suggestions) };
};
