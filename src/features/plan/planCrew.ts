/**
 * Pure helpers for the plan's "who's in" line and booking links — unit-tested.
 * `crewFor` lists the members who voted YES on the front-runner (the people
 * you'd actually go with); `joinNames` renders them as "Alex, Priya & Sam".
 */
import type { InterestRecord } from '../../lib/dataClient';

export function crewFor(
  interests: Pick<InterestRecord, 'destinationId' | 'memberName' | 'level'>[],
  destinationId: string,
): string[] {
  // prettier-ignore
  return interests
    .filter((i) => i.destinationId === destinationId && i.level === 'YES')
    .map((i) => i.memberName)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * "Alex", "Alex & Sam", "Alex, Priya & Sam" — an Oxford-free natural list.
 * When a crew is bigger than `max`, the tail is summarized ("Alex, Priya & 5
 * others") so the plan headline stays punchy and the destination isn't buried
 * under a wrapping wall of names.
 */
export function joinNames(names: string[], max = Infinity): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length > max) {
    const shown = names.slice(0, max).join(', ');
    const rest = names.length - max;
    return `${shown} & ${rest} other${rest === 1 ? '' : 's'}`;
  }
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

/** The trip's agreed dates, threaded into booking searches so the CTA is
 * genuinely pre-filled for "lock it in". Both stamps are YYYY-MM-DD. */
export interface BookingDates {
  start: string;
  end: string;
}

/** A Google Flights search URL to the destination (booking the trip). We link to
 * a search, never a fabricated deep link, so it always resolves. When the group
 * has agreed dates, they ride along in the natural-language query. */
export function flightsUrl(destinationName: string, dates?: BookingDates): string {
  const q = dates
    ? `flights to ${destinationName} from ${dates.start} to ${dates.end}`
    : `flights to ${destinationName}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

/** A Booking.com search URL for stays at the destination, pre-filled with the
 * agreed check-in/check-out when the trip has a window. */
export function hotelsUrl(destinationName: string, dates?: BookingDates): string {
  const base = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destinationName)}`;
  return dates ? `${base}&checkin=${dates.start}&checkout=${dates.end}` : base;
}
