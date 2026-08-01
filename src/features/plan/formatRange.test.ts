import { describe, it, expect } from 'vitest';
import { formatRange } from './formatRange';

describe('formatRange', () => {
  it('collapses a same-month range', () => {
    expect(formatRange('2027-06-12', '2027-06-18')).toBe('Jun 12–18, 2027');
  });

  it('shows both months when they differ within a year', () => {
    expect(formatRange('2027-06-28', '2027-07-02')).toBe('Jun 28 – Jul 2, 2027');
  });

  it('shows both years across a year boundary', () => {
    expect(formatRange('2027-12-30', '2028-01-02')).toBe('Dec 30, 2027 – Jan 2, 2028');
  });

  it('renders a single day', () => {
    expect(formatRange('2027-06-12', '2027-06-12')).toBe('Jun 12, 2027');
  });
});
