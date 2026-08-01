/**
 * Pure date-range helpers — unit-tested, no ambient clock. `enumerateDays`
 * lists every YYYY-MM-DD from start to end inclusive (order-independent inputs),
 * used to mark a whole selected span at once.
 */
export function enumerateDays(a: string, b: string): string[] {
  const [start, end] = a <= b ? [a, b] : [b, a];
  const out: string[] = [];
  const d = new Date(`${start}T00:00:00Z`);
  const last = `${end}`;
  for (let guard = 0; guard < 400; guard++) {
    const stamp = d.toISOString().slice(0, 10);
    out.push(stamp);
    if (stamp === last) break;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}
