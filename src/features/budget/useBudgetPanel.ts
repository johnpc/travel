import { useEffect, useState } from 'react';
import { useBudget, useSaveBudget, type BudgetFields } from './budgetApi';
import { computeBudget, type BudgetTotals } from './computeBudget';

export interface BudgetForm {
  flightPerPerson: string;
  lodgingPerNight: string;
  nights: string;
  seasonNote: string;
}

const EMPTY: BudgetForm = { flightPerPerson: '', lodgingPerNight: '', nights: '', seasonNote: '' };
const numOrNull = (s: string): number | null => (s.trim() === '' ? null : Number(s));

/**
 * Budget panel orchestration for one destination: loads the shared estimate,
 * seeds an editable form from it, computes live per-person/per-couple totals,
 * and saves. Lazily fetches only when expanded.
 */
export function useBudgetPanel(
  tripId: string | undefined,
  destinationId: string,
  expanded: boolean,
) {
  const query = useBudget(destinationId, expanded);
  const save = useSaveBudget(tripId, destinationId);
  const [form, setForm] = useState<BudgetForm>(EMPTY);

  // Seed the form from the loaded estimate (once it arrives).
  useEffect(() => {
    const e = query.data;
    if (!e) return;
    setForm({
      flightPerPerson: e.flightPerPerson?.toString() ?? '',
      lodgingPerNight: e.lodgingPerNight?.toString() ?? '',
      nights: e.nights?.toString() ?? '',
      seasonNote: e.seasonNote ?? '',
    });
  }, [query.data]);

  const set = (key: keyof BudgetForm, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const totals: BudgetTotals = computeBudget({
    flightPerPerson: numOrNull(form.flightPerPerson),
    lodgingPerNight: numOrNull(form.lodgingPerNight),
    nights: numOrNull(form.nights),
  });

  const submit = () => {
    const fields: BudgetFields = {
      flightPerPerson: numOrNull(form.flightPerPerson),
      lodgingPerNight: numOrNull(form.lodgingPerNight),
      nights: numOrNull(form.nights),
      seasonNote: form.seasonNote.trim() || null,
    };
    save.mutate(fields);
  };

  return {
    form,
    set,
    submit,
    totals,
    isSaving: save.isPending,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
  };
}
