/**
 * Pure budget math — unit-tested, no I/O. Turn the raw estimate inputs (flight
 * per person, lodging per night, nights) into per-person and per-couple totals.
 * Lodging is assumed shared by a couple (one room), so per-person lodging is
 * half the nightly rate × nights. Missing inputs count as 0.
 */
export interface BudgetInputs {
  flightPerPerson?: number | null;
  lodgingPerNight?: number | null;
  nights?: number | null;
}

export interface BudgetTotals {
  perPerson: number;
  perCouple: number;
  hasEstimate: boolean;
}

const num = (v: number | null | undefined): number => (typeof v === 'number' && v > 0 ? v : 0);

export function computeBudget(inputs: BudgetInputs): BudgetTotals {
  const flight = num(inputs.flightPerPerson);
  const lodgingNight = num(inputs.lodgingPerNight);
  const nights = num(inputs.nights);
  const lodgingTotal = lodgingNight * nights; // one room for a couple
  const perPerson = flight + lodgingTotal / 2;
  const perCouple = flight * 2 + lodgingTotal;
  return { perPerson, perCouple, hasEstimate: flight > 0 || lodgingTotal > 0 };
}

/** Format a whole-number currency amount, e.g. 1234 → "$1,234". */
export function formatMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}
