import { describe, it, expect } from 'vitest';
import { parseHotels } from './parseHotels';

const bodyWith = (input: unknown) => ({
  content: [{ type: 'tool_use', name: 'suggest_hotels', input }],
});

const hotel = (over = {}) => ({
  name: 'Grace Hotel',
  tier: 'Luxury',
  pricePerNight: 600,
  area: 'Imerovigli',
  pros: 'Stunning caldera infinity pool.',
  cons: 'Pricey and adults-only vibe.',
  ...over,
});

describe('parseHotels', () => {
  it('parses clean picks + median airbnb', () => {
    const out = parseHotels(bodyWith({ hotels: [hotel()], airbnbMedianPerNight: 180 }));
    expect(out.airbnbMedianPerNight).toBe(180);
    expect(out.hotels[0]).toEqual(hotel());
  });

  it('normalizes an unknown tier to Mid-range and drops nameless rows', () => {
    const out = parseHotels(
      bodyWith({ hotels: [hotel({ tier: 'fancy' }), { tier: 'Budget' }], airbnbMedianPerNight: 0 }),
    );
    expect(out.hotels).toHaveLength(1);
    expect(out.hotels[0].tier).toBe('Mid-range');
    expect(out.airbnbMedianPerNight).toBeNull(); // 0 → null
  });

  it('returns empty on a non-matching tool call or bad shape', () => {
    expect(parseHotels({ content: [{ type: 'text' }] })).toEqual({
      hotels: [],
      airbnbMedianPerNight: null,
    });
    expect(parseHotels(null)).toEqual({ hotels: [], airbnbMedianPerNight: null });
  });
});
