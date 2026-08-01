import { describe, it, expect } from 'vitest';
import { getYourGuideUrl } from './getYourGuide';

describe('getYourGuideUrl', () => {
  it('builds an encoded search URL from activity + destination', () => {
    const url = getYourGuideUrl('Santorini, Greece', 'Sunset catamaran cruise');
    expect(url).toBe(
      'https://www.getyourguide.com/s/?q=Sunset%20catamaran%20cruise%20Santorini%2C%20Greece',
    );
  });

  it('is always a getyourguide https search URL (safe to link)', () => {
    const url = getYourGuideUrl('X', 'Y');
    expect(url.startsWith('https://www.getyourguide.com/s/?q=')).toBe(true);
  });
});
