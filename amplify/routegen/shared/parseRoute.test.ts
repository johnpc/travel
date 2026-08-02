import { describe, it, expect } from 'vitest';
import { parseRoute } from './parseRoute';

const bodyWith = (stops: unknown) => ({
  content: [{ type: 'tool_use', name: 'suggest_route', input: { stops } }],
});

describe('parseRoute', () => {
  it('parses ordered stops preserving array order', () => {
    const out = parseRoute(
      bodyWith([
        { place: 'Tokyo', nights: 4, note: 'Start here.' },
        { place: 'Bangkok', nights: 3, note: 'Then south.' },
      ]),
    );
    expect(out.map((s) => s.place)).toEqual(['Tokyo', 'Bangkok']);
    expect(out[0]).toEqual({ place: 'Tokyo', nights: 4, note: 'Start here.' });
  });

  it('nulls bad nights and drops placeless rows', () => {
    const out = parseRoute(bodyWith([{ place: 'Phuket', nights: 0 }, { nights: 2 }, 'x']));
    expect(out).toEqual([{ place: 'Phuket', nights: null, note: '' }]);
  });

  it('returns [] on a non-matching tool call or bad shape', () => {
    expect(parseRoute({ content: [{ type: 'text' }] })).toEqual([]);
    expect(parseRoute(null)).toEqual([]);
  });
});
