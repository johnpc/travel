/**
 * Pure display copy for the plan card — unit-tested. Turns a best-date window
 * into a friendly line, or a nudge when nobody's marked overlapping free days.
 */
import { formatRange } from './formatRange';
import type { DateWindow } from './bestWindow';

export function bestWindowLabel(window: DateWindow | null): string {
  if (!window) return 'Mark your dates to find a window that works for everyone';
  const range = formatRange(window.start, window.end);
  // A window is the longest run where SOMEONE's free and NOBODY's blocked — not
  // a guarantee the whole crew is free (the per-window "N of M free" carries
  // that). So say "works so far", never "everyone's free", to avoid overclaiming.
  if (window.days === 1) return `${range} works so far`;
  return `${range} — ${window.days} days that work so far`;
}

/** "· N of M voted" suffix for the plan hero's tally — tells the crew whether
 * everyone has weighed in on the front-runner yet, so "you're aligned" is read
 * against the whole group. Empty unless the roster size is a plausible
 * denominator (mirrors the per-destination vote row). */
export function votedSuffix(
  votes: { yes: number; maybe: number; no: number },
  memberCount?: number,
): string {
  const voted = votes.yes + votes.maybe + votes.no;
  return memberCount && memberCount >= voted ? ` · ${voted} of ${memberCount} voted` : '';
}

/** The plan-hero kicker. For someone who's joined the trip it's "theirs"; for a
 * newcomer who hasn't picked a name it's the CREW's plan — an invitation, not a
 * done deal (avoids "did they decide without me?" on a trip you haven't joined). */
export function planKicker(readyToBook: boolean, hasJoined: boolean): string {
  if (hasJoined) return readyToBook ? 'Your trip' : 'The plan so far';
  return readyToBook ? "The crew's pick" : 'Where the crew is leaning';
}
