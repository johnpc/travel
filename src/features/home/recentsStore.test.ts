import { describe, it, expect } from 'vitest';
import { readRecents, recordRecent, removeRecent } from './recentsStore';

/** Minimal in-memory Storage stand-in for the pure store. */
function memStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  };
}

describe('recentsStore', () => {
  it('returns an empty list when nothing is stored or the value is junk', () => {
    expect(readRecents(memStorage())).toEqual([]);
    expect(readRecents(memStorage({ 'tv-recents': 'not json' }))).toEqual([]);
    expect(readRecents(memStorage({ 'tv-recents': '{"not":"array"}' }))).toEqual([]);
  });

  it('records a visit at the front and reads it back', () => {
    const s = memStorage();
    const list = recordRecent({ slug: 'greece-2027', title: 'Greece 2027' }, s);
    expect(list).toEqual([{ slug: 'greece-2027', title: 'Greece 2027' }]);
    expect(readRecents(s)).toEqual(list);
  });

  it('moves a repeat visit to the front without duplicating it', () => {
    const s = memStorage();
    recordRecent({ slug: 'a', title: 'A' }, s);
    recordRecent({ slug: 'b', title: 'B' }, s);
    const list = recordRecent({ slug: 'a', title: 'A' }, s);
    expect(list.map((r) => r.slug)).toEqual(['a', 'b']);
  });

  it('caps the list at 8 most-recent trips', () => {
    const s = memStorage();
    for (let i = 0; i < 12; i++) recordRecent({ slug: `t${i}`, title: `T${i}` }, s);
    const list = readRecents(s);
    expect(list).toHaveLength(8);
    expect(list[0].slug).toBe('t11'); // newest first
  });

  it('ignores an empty slug', () => {
    const s = memStorage();
    expect(recordRecent({ slug: '', title: 'Nope' }, s)).toEqual([]);
  });

  it('drops malformed entries when reading', () => {
    const s = memStorage({
      'tv-recents': JSON.stringify([{ slug: 'ok', title: 'OK' }, { slug: 5 }]),
    });
    expect(readRecents(s)).toEqual([{ slug: 'ok', title: 'OK' }]);
  });

  it('removeRecent drops one trip and persists the rest', () => {
    const s = memStorage();
    recordRecent({ slug: 'a', title: 'A' }, s);
    recordRecent({ slug: 'b', title: 'B' }, s);
    expect(removeRecent('a', s).map((r) => r.slug)).toEqual(['b']);
    expect(readRecents(s).map((r) => r.slug)).toEqual(['b']); // persisted
  });
});
