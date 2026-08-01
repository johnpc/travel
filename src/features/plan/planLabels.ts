/**
 * Pure display copy for the plan card — unit-tested. Turns a best-date window
 * into a friendly line, or a nudge when nobody's marked overlapping free days.
 */
import { formatRange } from './formatRange';
import type { DateWindow } from './bestWindow';

export function bestWindowLabel(window: DateWindow | null): string {
  if (!window) return 'Mark your dates to find a window that works for everyone';
  const range = formatRange(window.start, window.end);
  if (window.days === 1) return `${range} works so far`;
  return `${range} — ${window.days} days everyone's free`;
}
