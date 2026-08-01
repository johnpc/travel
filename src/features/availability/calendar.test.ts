import { describe, it, expect } from 'vitest';
import { stamp, daysInMonth, firstWeekday, monthGrid, shiftMonth } from './calendar';

describe('calendar helpers', () => {
  it('stamp zero-pads month and day', () => {
    expect(stamp(2027, 3, 5)).toBe('2027-03-05');
  });

  it('daysInMonth handles leap February', () => {
    expect(daysInMonth(2027, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2027, 4)).toBe(30);
  });

  it('firstWeekday: 2027-03-01 is a Monday (1)', () => {
    expect(firstWeekday(2027, 3)).toBe(1);
  });
});

describe('monthGrid', () => {
  it('builds weeks of 7 with leading/trailing null padding', () => {
    const grid = monthGrid(2027, 3); // March 2027 starts Monday, 31 days
    expect(grid[0]).toHaveLength(7);
    expect(grid[0][0]).toBeNull(); // Sunday before Mon the 1st
    expect(grid[0][1]).toBe('2027-03-01');
    // every week is 7 cells; all in-month days present
    expect(grid.every((w) => w.length === 7)).toBe(true);
    const days = grid.flat().filter(Boolean);
    expect(days).toHaveLength(31);
    expect(days.at(-1)).toBe('2027-03-31');
  });
});

describe('shiftMonth', () => {
  it('advances and wraps the year in both directions', () => {
    expect(shiftMonth(2027, 12, 1)).toEqual({ year: 2028, month: 1 });
    expect(shiftMonth(2027, 1, -1)).toEqual({ year: 2026, month: 12 });
    expect(shiftMonth(2027, 6, 3)).toEqual({ year: 2027, month: 9 });
  });
});
