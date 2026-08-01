/**
 * Pure date-range formatter — unit-tested. Turn two YYYY-MM-DD stamps into a
 * compact human range, collapsing shared month/year: "Jun 12–18, 2027",
 * "Jun 28 – Jul 2, 2027", "Dec 30, 2027 – Jan 2, 2028", or "Jun 12, 2027" for a
 * single day. Parsed as UTC so the day never shifts by timezone.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Parts {
  y: number;
  m: number; // 0-11
  d: number;
}

const parse = (stamp: string): Parts => {
  const [y, m, d] = stamp.split('-').map(Number);
  return { y, m: m - 1, d };
};

const day = (p: Parts): string => `${MONTHS[p.m]} ${p.d}`;

export function formatRange(start: string, end: string): string {
  const a = parse(start);
  const b = parse(end);
  if (start === end) return `${day(a)}, ${a.y}`;
  if (a.y !== b.y) return `${day(a)}, ${a.y} – ${day(b)}, ${b.y}`;
  if (a.m !== b.m) return `${day(a)} – ${day(b)}, ${b.y}`;
  return `${MONTHS[a.m]} ${a.d}–${b.d}, ${b.y}`;
}
