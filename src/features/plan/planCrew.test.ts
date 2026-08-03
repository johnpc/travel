import { describe, it, expect } from 'vitest';
import { crewFor, joinNames, flightsUrl, hotelsUrl } from './planCrew';
import type { InterestRecord } from '../../lib/dataClient';

const i = (destinationId: string, memberName: string, level: string) =>
  ({ destinationId, memberName, level }) as InterestRecord;

describe('crewFor', () => {
  it('lists (sorted) the members who voted YES on the destination', () => {
    const votes = [
      i('d1', 'Sam', 'YES'),
      i('d1', 'Alex', 'YES'),
      i('d1', 'Priya', 'MAYBE'),
      i('d2', 'Jordan', 'YES'),
    ];
    expect(crewFor(votes, 'd1')).toEqual(['Alex', 'Sam']);
  });
});

describe('joinNames', () => {
  it('renders natural lists', () => {
    expect(joinNames([])).toBe('');
    expect(joinNames(['Alex'])).toBe('Alex');
    expect(joinNames(['Alex', 'Sam'])).toBe('Alex & Sam');
    expect(joinNames(['Alex', 'Priya', 'Sam'])).toBe('Alex, Priya & Sam');
  });

  it('summarizes the tail past max so a big crew stays a punchy headline', () => {
    const crew = ['Alex', 'Priya', 'Sam', 'Jordan', 'Casey', 'Riley', 'Robin'];
    expect(joinNames(crew, 3)).toBe('Alex, Priya, Sam & 4 others');
    // one over the cap → "& 1 other" (singular)
    expect(joinNames(['Alex', 'Priya', 'Sam', 'Jordan'], 3)).toBe('Alex, Priya, Sam & 1 other');
    // at or under the cap → the plain natural list, no summary
    expect(joinNames(['Alex', 'Priya', 'Sam'], 3)).toBe('Alex, Priya & Sam');
  });
});

describe('booking links', () => {
  it('build encoded flight + hotel search URLs', () => {
    expect(flightsUrl('Lisbon, Portugal')).toContain('google.com/travel/flights');
    expect(flightsUrl('Lisbon, Portugal')).toContain(encodeURIComponent('flights to Lisbon, Portugal')); // prettier-ignore
    expect(hotelsUrl('Lisbon, Portugal')).toBe(
      'https://www.booking.com/searchresults.html?ss=Lisbon%2C%20Portugal',
    );
  });

  it('pre-fills the agreed dates when a window is passed', () => {
    const dates = { start: '2027-06-12', end: '2027-06-18' };
    expect(flightsUrl('Lisbon, Portugal', dates)).toContain(
      encodeURIComponent('flights to Lisbon, Portugal from 2027-06-12 to 2027-06-18'),
    );
    expect(hotelsUrl('Lisbon, Portugal', dates)).toBe(
      'https://www.booking.com/searchresults.html?ss=Lisbon%2C%20Portugal&checkin=2027-06-12&checkout=2027-06-18',
    );
  });
});
