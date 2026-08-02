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

/** "Alex", "Alex & Sam", "Alex, Priya & Sam" — an Oxford-free natural list. */
export function joinNames(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

/** A Google Flights search URL to the destination (booking the trip). We link to
 * a search, never a fabricated deep link, so it always resolves. */
export function flightsUrl(destinationName: string): string {
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(`flights to ${destinationName}`)}`; // prettier-ignore
}

/** A Booking.com search URL for stays at the destination. */
export function hotelsUrl(destinationName: string): string {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destinationName)}`;
}
