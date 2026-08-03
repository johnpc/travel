import { describe, it, expect } from 'vitest';
import { linkifySegments } from './linkify';

describe('linkifySegments', () => {
  it('returns a single text segment when there is no URL', () => {
    expect(linkifySegments('lets go to Santorini!')).toEqual([
      { type: 'text', value: 'lets go to Santorini!' },
    ]);
  });

  it('splits a URL out of surrounding text', () => {
    expect(linkifySegments('see https://airbnb.com/x here')).toEqual([
      { type: 'text', value: 'see ' },
      { type: 'link', value: 'https://airbnb.com/x' },
      { type: 'text', value: ' here' },
    ]);
  });

  it('keeps trailing sentence punctuation out of the link', () => {
    expect(linkifySegments('book it (https://x.com/a).')).toEqual([
      { type: 'text', value: 'book it (' },
      { type: 'link', value: 'https://x.com/a' },
      { type: 'text', value: ').' },
    ]);
  });

  it('linkifies http and https, multiple per message', () => {
    const segs = linkifySegments('http://a.com and https://b.com');
    expect(segs.filter((s) => s.type === 'link').map((s) => s.value)).toEqual([
      'http://a.com',
      'https://b.com',
    ]);
  });

  it('does NOT linkify javascript: or data: or bare words (XSS-safe)', () => {
    for (const evil of ['javascript:alert(1)', 'data:text/html,x', 'www.nope.com just text']) {
      expect(linkifySegments(evil).every((s) => s.type === 'text')).toBe(true);
    }
  });
});
