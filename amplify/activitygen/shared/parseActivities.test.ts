import { describe, it, expect } from 'vitest';
import { parseActivities } from './parseActivities';

const bodyWith = (activities: unknown) => ({
  content: [{ type: 'tool_use', name: 'suggest_activities', input: { activities } }],
});

describe('parseActivities', () => {
  it('parses clean activities', () => {
    const out = parseActivities(
      bodyWith([{ title: 'Wine tour', blurb: 'Taste local wines.', category: 'Food & Drink' }]),
    );
    expect(out).toEqual([{ title: 'Wine tour', blurb: 'Taste local wines.', category: 'Food & Drink' }]); // prettier-ignore
  });

  it('defaults a missing category and drops rows missing title/blurb', () => {
    const out = parseActivities(
      bodyWith([{ title: 'Hike', blurb: 'Coastal trail.' }, { title: 'NoBlurb' }, 'nope']),
    );
    expect(out).toEqual([{ title: 'Hike', blurb: 'Coastal trail.', category: 'Other' }]);
  });

  it('returns [] on a non-matching tool call or bad shape', () => {
    expect(parseActivities({ content: [{ type: 'text' }] })).toEqual([]);
    expect(parseActivities(bodyWith('x'))).toEqual([]);
    expect(parseActivities(null)).toEqual([]);
  });
});
