import { describe, it, expect } from 'vitest';
import { buildHotelRequest } from './hotelPrompt';

describe('buildHotelRequest', () => {
  it('forces the suggest_hotels tool and names the destination', () => {
    const body = JSON.parse(buildHotelRequest({ destinationName: 'Santorini' }));
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'suggest_hotels' });
    expect(body.tools[0].name).toBe('suggest_hotels');
    expect(body.messages[0].content).toContain('Santorini');
  });

  it('requires hotels + median airbnb, and each hotel has tier/price/pros/cons', () => {
    const body = JSON.parse(buildHotelRequest({ destinationName: 'Kyoto' }));
    const schema = body.tools[0].input_schema;
    expect(schema.required).toEqual(expect.arrayContaining(['hotels', 'airbnbMedianPerNight']));
    expect(schema.properties.hotels.items.required).toEqual(
      expect.arrayContaining(['name', 'tier', 'pricePerNight', 'area', 'pros', 'cons']),
    );
  });

  it('asks for real properties across the three tiers', () => {
    const body = JSON.parse(buildHotelRequest({ destinationName: 'Lisbon' }));
    expect(body.system).toMatch(/Budget/);
    expect(body.system).toMatch(/Luxury/);
    expect(body.system).toMatch(/REAL/);
  });
});
