import { describe, it, expect } from 'vitest';
import { flightsUrl, hotelsUrl, airbnbUrl } from './bookingLinks';

describe('bookingLinks', () => {
  it('builds a Google Flights search from DTW to the place', () => {
    const url = flightsUrl('Santorini, Greece');
    expect(url).toContain('google.com/travel/flights');
    // DTW origin + place (country dropped), URL-encoded
    expect(decodeURIComponent(url)).toContain('flights from DTW to Santorini');
    expect(decodeURIComponent(url)).not.toContain('Greece');
  });

  it('builds a Booking.com hotel search for the place', () => {
    const url = hotelsUrl('Lisbon, Portugal');
    expect(url).toContain('booking.com/searchresults');
    expect(url).toContain('ss=Lisbon');
  });

  it('builds an Airbnb search for the place', () => {
    const url = airbnbUrl('Kyoto, Japan');
    expect(url).toContain('airbnb.com/s/Kyoto/homes');
  });

  it('handles a freeform name with no country part', () => {
    expect(decodeURIComponent(flightsUrl('Zambia safari'))).toContain('to Zambia safari');
    expect(hotelsUrl('Zambia safari')).toContain('ss=Zambia%20safari');
  });
});
