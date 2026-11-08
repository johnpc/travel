import { describe, it, expect } from 'vitest';
import { emptyOverlay, matchesFilter, mergeLive, reconcile, type LiveItem } from './liveMerge';

type Row = LiveItem & { tripId?: string; name?: string };
const overlay = (upserts: Row[] = [], deleted: string[] = []) => ({
  upserts: new Map(upserts.map((r) => [r.id, r])),
  deleted: new Set(deleted),
});

describe('matchesFilter', () => {
  it('matches every eq condition', () => {
    expect(matchesFilter({ tripId: 't1', x: 1 }, { tripId: { eq: 't1' } })).toBe(true);
    expect(matchesFilter({ tripId: 't2' }, { tripId: { eq: 't1' } })).toBe(false);
    expect(matchesFilter({ tripId: 't1' }, {})).toBe(true);
  });
  it('never guesses on filters it does not understand', () => {
    expect(matchesFilter({ n: 3 }, { n: { gt: 1 } })).toBe(false);
    expect(matchesFilter({ n: 3 }, { n: null as unknown as object })).toBe(false);
  });
});

describe('mergeLive', () => {
  it('returns the server rows when nothing is pending', () => {
    expect(mergeLive([{ id: 'a' }], emptyOverlay())).toEqual([{ id: 'a' }]);
  });
  it('adds a row the server view missed', () => {
    const out = mergeLive<Row>([{ id: 'a' }], overlay([{ id: 'b', name: 'B' }]));
    expect(out.map((r) => r.id)).toEqual(['a', 'b']);
  });
  it('prefers whichever copy of a row is newer', () => {
    const server: Row[] = [{ id: 'a', name: 'old', updatedAt: '2026-01-01' }];
    expect(mergeLive(server, overlay([{ id: 'a', name: 'new', updatedAt: '2026-02-01' }]))[0].name).toBe('new'); // prettier-ignore
    expect(mergeLive(server, overlay([{ id: 'a', name: 'stale', updatedAt: '2025-12-01' }]))[0].name).toBe('old'); // prettier-ignore
  });
  it('hides rows with a pending delete', () => {
    expect(mergeLive<Row>([{ id: 'a' }, { id: 'b' }], overlay([], ['a']))).toEqual([{ id: 'b' }]);
  });
});

describe('reconcile', () => {
  it('drops writes the server now reflects and keeps ones it is behind on', () => {
    const o = overlay(
      [
        { id: 'seen', updatedAt: '2026-01-01' },
        { id: 'ahead', updatedAt: '2026-03-01' },
        { id: 'missing' },
      ],
      ['gone', 'still'],
    );
    const server: Row[] = [
      { id: 'seen', updatedAt: '2026-01-01' },
      { id: 'ahead', updatedAt: '2026-02-01' },
      { id: 'still' },
    ];
    const out = reconcile(server, o);
    expect([...out.upserts.keys()]).toEqual(['ahead', 'missing']);
    expect([...out.deleted]).toEqual(['still']);
  });
});
