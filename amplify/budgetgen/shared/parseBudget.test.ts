import { describe, it, expect } from 'vitest';
import { parseBudget } from './parseBudget';

const bodyWith = (input: unknown) => ({
  content: [{ type: 'tool_use', name: 'estimate_budget', input }],
});

describe('parseBudget', () => {
  it('parses a clean estimate', () => {
    const out = parseBudget(
      bodyWith({ flightPerPerson: 650, lodgingPerNight: 220, nights: 6, seasonNote: 'Cheaper in May' }), // prettier-ignore
    );
    expect(out).toEqual({
      flightPerPerson: 650,
      lodgingPerNight: 220,
      nights: 6,
      seasonNote: 'Cheaper in May',
    });
  });

  it('rounds numbers and nulls non-positive/invalid ones', () => {
    const out = parseBudget(
      bodyWith({ flightPerPerson: 512.6, lodgingPerNight: 0, nights: -1, seasonNote: '  ' }),
    );
    expect(out).toEqual({
      flightPerPerson: 513,
      lodgingPerNight: null,
      nights: null,
      seasonNote: null,
    });
  });

  it('returns all-null on a non-matching tool call or bad shape', () => {
    const empty = { flightPerPerson: null, lodgingPerNight: null, nights: null, seasonNote: null };
    expect(parseBudget({ content: [{ type: 'text' }] })).toEqual(empty);
    expect(parseBudget(null)).toEqual(empty);
  });
});
