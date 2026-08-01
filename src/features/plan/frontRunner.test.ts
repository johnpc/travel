import { describe, it, expect } from 'vitest';
import { pickFrontRunner } from './frontRunner';
import type { DestinationRecord } from '../../lib/dataClient';
import type { Tally } from '../interest/tally';

const d = (id: string, name: string) => ({ id, name }) as DestinationRecord;
const t = (score: number, yes = 0): Tally => ({ yes, maybe: 0, no: 0, score });

describe('pickFrontRunner', () => {
  it('returns null when there are no destinations', () => {
    expect(pickFrontRunner([], {})).toBeNull();
  });

  it('picks the highest net score', () => {
    const dests = [d('a', 'Athens'), d('b', 'Bali'), d('c', 'Cairo')];
    const winner = pickFrontRunner(dests, { a: t(1), b: t(3), c: t(-1) });
    expect(winner?.id).toBe('b');
  });

  it('breaks score ties by more YES votes', () => {
    const dests = [d('a', 'Athens'), d('b', 'Bali')];
    const winner = pickFrontRunner(dests, { a: t(2, 2), b: t(2, 5) });
    expect(winner?.id).toBe('b');
  });

  it('treats a destination with no tally as score 0 (still eligible)', () => {
    const dests = [d('a', 'Athens'), d('b', 'Bali')];
    const winner = pickFrontRunner(dests, { a: t(-2) }); // b has no votes → 0 > -2
    expect(winner?.id).toBe('b');
  });
});
