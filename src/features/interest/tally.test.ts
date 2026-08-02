import { describe, it, expect } from 'vitest';
import { tallyVotes, tallyByDestination, myLevel, consensusBar } from './tally';
import type { InterestRecord } from '../../lib/dataClient';

const v = (destinationId: string, memberName: string, level: string) =>
  ({ destinationId, memberName, level }) as InterestRecord;

describe('tallyVotes', () => {
  it('counts each level and computes a net score', () => {
    const t = tallyVotes([{ level: 'YES' }, { level: 'YES' }, { level: 'MAYBE' }, { level: 'NO' }]);
    expect(t).toEqual({ yes: 2, maybe: 1, no: 1, score: 1 }); // +1 +1 +0 -1
  });

  it('ignores null levels', () => {
    expect(tallyVotes([{ level: null }, { level: 'YES' }])).toEqual({
      yes: 1,
      maybe: 0,
      no: 0,
      score: 1,
    });
  });
});

describe('tallyByDestination', () => {
  it('groups votes per destination', () => {
    const out = tallyByDestination([v('a', 'Al', 'YES'), v('a', 'Sam', 'NO'), v('b', 'Al', 'YES')]);
    expect(out.a).toEqual({ yes: 1, maybe: 0, no: 1, score: 0 });
    expect(out.b.score).toBe(1);
  });
});

describe('myLevel', () => {
  const votes = [v('a', 'Alex', 'YES'), v('a', 'Sam', 'NO')];
  it('returns this member’s level for a destination', () => {
    expect(myLevel(votes, 'a', 'Alex')).toBe('YES');
    expect(myLevel(votes, 'a', 'Sam')).toBe('NO');
  });
  it('returns null when the member has not voted or has no identity', () => {
    expect(myLevel(votes, 'a', 'Priya')).toBeNull();
    expect(myLevel(votes, 'b', 'Alex')).toBeNull();
    expect(myLevel(votes, 'a', null)).toBeNull();
  });
});

describe('consensusBar', () => {
  it('is empty when nobody has voted', () => {
    expect(consensusBar({ yes: 0, maybe: 0, no: 0, score: 0 })).toEqual({
      yesPct: 0,
      maybePct: 0,
      noPct: 0,
      total: 0,
    });
  });

  it('converts a tally into segment percentages', () => {
    const bar = consensusBar({ yes: 3, maybe: 1, no: 0, score: 3 });
    expect(bar.total).toBe(4);
    expect(bar.yesPct).toBe(75);
    expect(bar.maybePct).toBe(25);
    expect(bar.noPct).toBe(0);
  });
});
