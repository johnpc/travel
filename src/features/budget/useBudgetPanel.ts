import { useEffect, useState } from 'react';
import { useBudget, useSaveBudget, type BudgetFields } from './budgetApi';
import { useEstimateBudget } from './estimateBudgetApi';
import { computeBudget, type BudgetTotals } from './computeBudget';

export interface BudgetForm {
  flightPerPerson: string;
  lodgingPerNight: string;
  nights: string;
  seasonNote: string;
}

const EMPTY: BudgetForm = { flightPerPerson: '', lodgingPerNight: '', nights: '', seasonNote: '' };
const numOrNull = (s: string): number | null => (s.trim() === '' ? null : Number(s));
const str = (n: number | null): string => (n == null ? '' : String(n));

/**
 * Budget panel orchestration for one destination: loads the shared estimate,
 * seeds an editable form from it, computes live per-person/per-couple totals,
 * saves, and can AI-estimate the numbers to fill the fields. Lazy-fetches only
 * when expanded.
 */
export function useBudgetPanel(
  tripId: string | undefined,
  destinationId: string,
  expanded: boolean,
  destinationName = '',
) {
  const query = useBudget(destinationId, expanded);
  const save = useSaveBudget(tripId, destinationId);
  const [justSaved, setJustSaved] = useState(false);
  const estimate = useEstimateBudget();
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

  // Flash a "Saved ✓" confirmation for 2s — Save is the one discrete action with
  // no inline payoff (unlike votes turning teal or days going green).
  const submit = () => {
    const fields: BudgetFields = {
      flightPerPerson: numOrNull(form.flightPerPerson),
      lodgingPerNight: numOrNull(form.lodgingPerNight),
      nights: numOrNull(form.nights),
      seasonNote: form.seasonNote.trim() || null,
    };
    save.mutate(fields, {
      onSuccess: () => {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
      },
    });
  };

  // AI ballpark → fill the fields (keeping anything the user already typed).
  const runEstimate = async () => {
    if (!destinationName) return;
    const e = await estimate.mutateAsync({ destinationName });
    setForm((f) => ({
      flightPerPerson: f.flightPerPerson || str(e.flightPerPerson),
      lodgingPerNight: f.lodgingPerNight || str(e.lodgingPerNight),
      nights: f.nights || str(e.nights),
      seasonNote: f.seasonNote || (e.seasonNote ?? ''),
    }));
  };

  return {
    form,
    set,
    submit,
    totals,
    runEstimate,
    isEstimating: estimate.isPending,
    isSaving: save.isPending,
    justSaved,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
  };
}
