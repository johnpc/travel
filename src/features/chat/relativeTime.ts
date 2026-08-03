/**
 * Pure relative-time label for chat messages — "just now", "5m", "3h", "2d", or a
 * short date past a week. Async group consensus needs "when was this said?": a
 * bare "booking flights this week!" is ambiguous without knowing it's from today
 * vs a month ago. `now` is injected (no ambient clock) so it stays deterministic
 * and unit-testable, per the project's determinism rule.
 */
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function relativeTime(iso: string | null | undefined, now: number): string {
  if (!iso) return '';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const diff = now - then;
  if (diff < MIN) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MIN)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d`;
  return new Date(then).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
