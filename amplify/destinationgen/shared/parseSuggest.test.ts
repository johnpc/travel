import { describe, it, expect } from 'vitest';
import { parseSuggestions } from './parseSuggest';

const bodyWith = (destinations: unknown) => ({
  content: [{ type: 'tool_use', name: 'suggest_destinations', input: { destinations } }],
});

describe('parseSuggestions', () => {
  it('parses clean suggestions from the tool call', () => {
    const out = parseSuggestions(
      bodyWith([
        {
          name: 'Santorini',
          blurb: 'Blue domes over the caldera.',
          why: 'Iconic and group-friendly.',
        },
      ]),
    );
    expect(out).toEqual([
      {
        name: 'Santorini',
        blurb: 'Blue domes over the caldera.',
        why: 'Iconic and group-friendly.',
      },
    ]);
  });

  it('trims whitespace and drops rows missing any field', () => {
    const out = parseSuggestions(
      bodyWith([
        { name: '  Kyoto  ', blurb: 'Temples and gardens.', why: 'Calm and cultural.' },
        { name: 'NoBlurb', why: 'incomplete' },
        { name: 'NoWhy', blurb: 'incomplete' },
        'not an object',
      ]),
    );
    expect(out).toEqual([
      { name: 'Kyoto', blurb: 'Temples and gardens.', why: 'Calm and cultural.' },
    ]);
  });

  it('returns [] when there is no matching tool call or destinations array', () => {
    expect(parseSuggestions({ content: [{ type: 'text' }] })).toEqual([]);
    expect(parseSuggestions(bodyWith('nope'))).toEqual([]);
    expect(parseSuggestions({})).toEqual([]);
    expect(parseSuggestions(null)).toEqual([]);
  });
});
