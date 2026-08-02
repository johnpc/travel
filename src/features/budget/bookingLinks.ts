/**
 * Build SEARCH URLs that help fill in (or sanity-check) the rough budget: real,
 * current prices you look up yourself, never a hallucinated fare. Home airport is
 * Detroit (DTW) — the group's default origin. Links point at searches (not a
 * specific fare/listing) so they always resolve. `wikiTitle`-style trimming keeps
 * "Santorini, Greece" → "Santorini". Pure + unit-tested (no network).
 */
const HOME_AIRPORT = 'DTW';

/** Just the place, dropping a trailing ", Country" so searches stay broad. */
function place(destinationName: string): string {
  return destinationName.split(',')[0].trim();
}

/** Google Flights search from the home airport to the destination. */
export function flightsUrl(destinationName: string): string {
  const q = `flights from ${HOME_AIRPORT} to ${place(destinationName)}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

/** Booking.com hotel search for the destination (avg nightly lodging). */
export function hotelsUrl(destinationName: string): string {
  const q = encodeURIComponent(place(destinationName));
  return `https://www.booking.com/searchresults.html?ss=${q}`;
}

/** Airbnb search for the destination (compare against median stay price). */
export function airbnbUrl(destinationName: string): string {
  const q = encodeURIComponent(place(destinationName));
  return `https://www.airbnb.com/s/${q}/homes`;
}

/** Booking.com search for a SPECIFIC hotel at a destination — resolves to the
 * real property page (with its real photos/price), never a guessed dead URL. */
export function hotelBookingUrl(hotelName: string, destinationName: string): string {
  const q = encodeURIComponent(`${hotelName} ${place(destinationName)}`);
  return `https://www.booking.com/searchresults.html?ss=${q}`;
}

/** Google Maps search for a specific hotel — its location, photos, and reviews. */
export function hotelMapUrl(hotelName: string, destinationName: string): string {
  const q = encodeURIComponent(`${hotelName} ${place(destinationName)}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
