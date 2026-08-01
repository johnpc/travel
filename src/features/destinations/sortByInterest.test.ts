import { describe, it, expect } from 'vitest';
import { sortByInterest } from './sortByInterest';
import type { DestinationRecord } from '../../lib/dataClient';
import type { Tally } from '../interest/tally';

const d = (id: string, createdAt: string) => ({ id, name: id, createdAt }) as DestinationRecord;
const tally = (score: number): Tally => ({ yes: 0, maybe: 0, no: 0, score });

describe('sortByInterest', () => {
  it('orders by net score, most-wanted first', () => {
    const out = sortByInterest([d('a', '1'), d('b', '2'), d('c', '3')], {
      a: tally(1),
      b: tally(3),
      c: tally(-1),
    });
    expect(out.map((x) => x.id)).toEqual(['b', 'a', 'c']);
  });

  it('breaks ties by newest-first and defaults missing tallies to 0', () => {
    const out = sortByInterest([d('old', '2026-01-01'), d('new', '2026-02-01')], {});
    expect(out.map((x) => x.id)).toEqual(['new', 'old']);
  });

  it('does not mutate the input array', () => {
    const input = [d('a', '1'), d('b', '2')];
    sortByInterest(input, { b: tally(5) });
    expect(input.map((x) => x.id)).toEqual(['a', 'b']);
  });
});
